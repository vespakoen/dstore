var _ = require('underscore');
var BBPromise = require('bluebird');

function PoorMansSync(levelAdapter, itemTransformer, publisher) {
  this.levelAdapter = levelAdapter;
  this.itemTransformer = itemTransformer;
  this.publisher = publisher;
}

PoorMansSync.attachKey = 'poormanssync';

PoorMansSync.attach = function (app) {
  return BBPromise.join(
    app.get('storage.level.adapter'),
    app.get('storage.itemtransformer'),
    app.get('queue')
      .then(function (queue) {
        return queue.setupPublisher();
      })
  )
  .spread(function (levelAdapter, itemTransformer, publisher) {
    return new PoorMansSync(levelAdapter, itemTransformer, publisher);
  });
}

PoorMansSync.prototype.sync = function (projectId, projectVersion, blueprints) {
  var self = this;
  var promises = [];
  
  var client = this.levelAdapter.getClient(projectId, projectVersion - 1);

  _.each(blueprints, function (blueprint, blueprintId) {
    promises.push(new BBPromise(function (resolve) {
      var itemByTypeDb = client.sublevel('item-by-type');
      var table = itemByTypeDb.sublevel(blueprintId);
      var innerPromises = [];
      return table
        .createReadStream()
        .on('data', function (data) {
          var item = JSON.parse(data.value);

          innerPromises.push(self.itemTransformer.transform(projectId, blueprintId, item, projectVersion)
            .then(function (transformedItem) {
              return self.publisher.publish('put-item-for-single-version', {
                project_id: projectId,
                blueprint_id: blueprintId,
                id: data.key,
                item: transformedItem
              });
            }));
        })
        .on('end', function () {
          resolve(BBPromise.all(innerPromises));
        })
    }));
  });

  return BBPromise.all(promises);
};

module.exports = PoorMansSync;
