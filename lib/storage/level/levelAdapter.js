'use strict';

var level = require('level-party');
var sublevel = require('level-sublevel');
var BBPromise = require('bluebird');
var mkdirp = BBPromise.promisify(require('mkdirp'));

/**
 * LevelAdapter
 * 
 * @class storage.level.LevelAdapter
 *
 * @param {String} path
 */
function LevelAdapter(path) {
  this.path = path;
  this.connections = {};
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
LevelAdapter.attachKey = 'storage.level.adapter';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {storage.level.LevelAdapter} A LevelAdapter instance with resolved dependencies
 */
LevelAdapter.attach = function(app) {
  return mkdirp(app.config.level.path)
    .then(function () {
      return new LevelAdapter(app.config.level.path);
    });
};

/**
 * Get the level client.
 *
 * @param  {String} projectId
 * @param  {Number} projectVersion
 *
 * @return {storage.elasticsearch.ElasticsearchClient}
 */
LevelAdapter.prototype.getClient = function(projectId, projectVersion) {
  if (!this.connections[projectId + projectVersion]) {
    this.connections[projectId + projectVersion] = sublevel(level(this.path + '/' + projectId + 'v' + projectVersion));
  }
  return this.connections[projectId + projectVersion];
};

/**
 * Closes all connections
 */
LevelAdapter.prototype.closeConnections = function() {
  Object.keys(this.connections).forEach(function (connectionKey) {
    this.connections[connectionKey].close();
  }, this);
};

module.exports = LevelAdapter;
