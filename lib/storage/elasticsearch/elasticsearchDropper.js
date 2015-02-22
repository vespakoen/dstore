//   return BBPromise.join(
//     exec('curl -XDELETE ' + app.config.elasticsearch.hosts[0] + '/blueprintservicetestv1'),
//     exec('curl -XDELETE ' + app.config.elasticsearch.hosts[0] + '/blueprintservicetestv2')
//   );'use strict';

var _ = require('underscore');
var pg = require('pg');
var BBPromise = require('bluebird');
BBPromise.promisifyAll(pg);

/**
 * ElasticsearchDropper
 * 
 * @class storage.elasticsearch.ElasticsearchDropper
 * 
 * @param {project.ProjectService} projectService
 * @param {storage.elasticsearch.ElasticsearchClient} client
 */
function ElasticsearchDropper(projectService, client) {
  this.projectService = projectService;
  this.client = client;
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
ElasticsearchDropper.attachKey = 'storage.elasticsearch.dropper';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {BBPromise} A ElasticsearchDropper instance with resolved dependencies
 */
ElasticsearchDropper.attach = function(app) {
  return BBPromise.join(
    app.get('project.service'),
    app.get('storage.elasticsearch.client')
  )
  .spread(function (projectService, client) {
    return new ElasticsearchDropper(projectService, client);
  });
};

/**
 * Create / migrate database.
 *
 * @param  {String} projectId
 * @param  {Number} projectVersion
 *
 * @return {BBPromise.<undefined>}
 */
ElasticsearchDropper.prototype.drop = function(projectId) {
  var self = this;
  var opts = {
    projectId: projectId,
  };

  return this.projectService.getProjectVersion(projectId)
    .then(function (projectVersion) {
      if (_.isNumber(projectVersion)) {
        var versions = _.range(1, projectVersion + 1);

        return BBPromise.all(_.map(versions, function (version) {
          opts.index = projectId + 'v' + version;
          return self._dropIndex(opts);
        }));
      }
    });
};

/**
 * Create a new elasticsearch index.
 *
 * @protected
 * @param opts
 * @param opts.index The name of the index to create
 *
 * @return {BBPromise.<undefined>}
 */
ElasticsearchDropper.prototype._dropIndex = function(opts) {
  var self = this;

  return self.client.indices.exists({
    index: opts.index
  })
  .then(function (exists) {
    return self.client.indices.delete({
      index: opts.index
    });
  })
  .catch(function () {
    // noop, indices.exists throws when the index doesn't exist
  });
};


module.exports = ElasticsearchDropper;


