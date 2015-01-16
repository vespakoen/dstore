'use strict';

var knex = require('knex');

function PostgresqlAdapter(config) {
  this.config = config;
  this.connections = {};
}

exports.attachKey = 'postgresql.adapter';

exports.attach = function(app) {
  return new PostgresqlAdapter(app.config.postgresql);
};

PostgresqlAdapter.prototype.getClient = function(namespace, version) {
  if (!this.connections[namespace + version]) {
    this.connections[namespace + version] = knex({
      client: 'postgresql',
      connection: {
        host: this.config.host,
        user: this.config.username,
        password: this.config.password,
        database: namespace + (version ? 'v' + version : '')
      }
    });
  }
  return this.connections[namespace + version];
};
