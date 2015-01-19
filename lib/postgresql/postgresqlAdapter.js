'use strict';

var knex = require('knex');

/**
 * @class postgresql.PostgresqlAdapter
 * 
 * PostgresqlAdapter
 * @param {Object} config The postgresql connection configuration
 */
function PostgresqlAdapter(config) {
  this.config = config;
  this.connections = {};
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
exports.attachKey = 'postgresql.adapter';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {this} A PostgresqlAdapter instance with resolved dependencies
 */
exports.attach = function(app) {
  return new PostgresqlAdapter(app.config.postgresql);
};

/**
 * Get the postgresql client.
 *
 * @param  {String} namespace
 * @param  {Number} version
 *
 * @return {postgresql.PostgresqlClient}
 */
PostgresqlAdapter.prototype.getClient = function(namespace, version) {
  if (!this.connections[namespace + version]) {
    var options = {
      client: 'postgresql',
      connection: {
        host: this.config.host,
        user: this.config.username,
        password: this.config.password,
        database: namespace + (version ? 'v' + version : '')
      }
    };
    this.connections[namespace + version] = knex(options);
  }
  return this.connections[namespace + version];
};

/**
 * Closes all connections
 */
PostgresqlAdapter.prototype.closeConnections = function() {
  Object.keys(this.connections).forEach(function (connectionKey) {
    this.connections[connectionKey].destroy();
  }, this);
};
