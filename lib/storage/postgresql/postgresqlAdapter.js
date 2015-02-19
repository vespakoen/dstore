'use strict';

var knex = require('knex');

/**
 * PostgresqlAdapter
 * 
 * @class storage.postgresql.PostgresqlAdapter
 * 
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
exports.attachKey = 'storage.postgresql.adapter';

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
 * @param  {String} projectId
 * @param  {Number} projectVersion
 *
 * @return {storage.postgresql.PostgresqlClient}
 */
PostgresqlAdapter.prototype.getClient = function(projectId, projectVersion) {
  if (!this.connections[projectId + projectVersion]) {
    var options = {
      client: 'postgresql',
      connection: {
        host: this.config.host,
        user: this.config.username,
        password: this.config.password,
        database: projectId + (projectVersion ? 'v' + projectVersion : '')
      }
    };
    this.connections[projectId + projectVersion] = knex(options);
  }
  return this.connections[projectId + projectVersion];
};

/**
 * Closes all connections
 */
PostgresqlAdapter.prototype.closeConnections = function() {
  Object.keys(this.connections).forEach(function (connectionKey) {
    this.connections[connectionKey].destroy();
  }, this);
};
