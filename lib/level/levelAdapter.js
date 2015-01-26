'use strict';

var level = require('level-party');
var sublevel = require('level-sublevel');
var BBPromise = require('bluebird');
var mkdirp = BBPromise.promisify(require('mkdirp'));

/**
 * LevelAdapter
 * 
 * @class level.LevelAdapter
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
LevelAdapter.attachKey = 'level.adapter';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {level.LevelAdapter} A LevelAdapter instance with resolved dependencies
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
 * @param  {String} namespace
 * @param  {Number} snapshotVersion
 *
 * @return {elasticsearch.ElasticsearchClient}
 */
LevelAdapter.prototype.getClient = function(namespace, snapshotVersion) {
  if (!this.connections[namespace + snapshotVersion]) {
    this.connections[namespace + snapshotVersion] = sublevel(level(this.path + '/' + namespace + 'v' + snapshotVersion));
  }
  return this.connections[namespace + snapshotVersion];
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
