'use strict';

var level = require('level-party');
var sublevel = require('level-sublevel');

/**
 * @class level.LevelAdapter
 * LevelAdapter
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
 * @return {BBPromise|Object} The object with resolved dependencies
 */
LevelAdapter.attach = function(app) {
  return new LevelAdapter(app.config.level.path);
};

/**
 * Get the level client.
 *
 * @param  {String} namespace
 * @param  {Number} version
 *
 * @return {elasticsearch.ElasticsearchClient}
 */
LevelAdapter.prototype.getClient = function(namespace, version) {
  if (!this.connections[namespace + version]) {
    this.connections[namespace + version] = sublevel(level(this.path + '/' + namespace + 'v' + version));
  }
  return this.connections[namespace + version];
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
