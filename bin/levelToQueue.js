'use strict';

var BBPromise = require('bluebird');
var app = require('../main');

var projectId = 'test';

BBPromise.all([
  app.get('queue').then(function (queue) {
    return queue.setupPublisher();
  }),
  app.get('level.adapter').then(function (adapter) {
    return adapter.getClient(projectId, 1)
      .then(function (client) {
        return client.sublevel('item-by-type');
      });
  }),
  app.get('blueprint')
]).spread(function (publisher, client, blueprint) {
  var blueprintIds = Object.keys(blueprint);
  blueprintIds.forEach(function (blueprintId) {
    client.sublevel(blueprintId)
      .createReadStream()
      .on('data', function (data) {
        var item = JSON.parse(data.value);

        console.log('queuing ' + projectId + ':' + blueprintId + ':' + item.id);
        publisher.publish('put-item', {
          project_id: projectId,
          blueprint_id: blueprintId,
          item: item
        });
      });
  });
});
