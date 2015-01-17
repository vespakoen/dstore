'use strict';

var fs = require('fs');
var BBPromise = require('bluebird');
var SchemaClient = require('./schemaClient');
BBPromise.promisifyAll(fs);

function PostgresqlSchemaClient(differ, namespace) {
  SchemaClient.call(this, differ);
  this.namespace = namespace;
}

PostgresqlSchemaClient.attachKey = 'schema.client';

PostgresqlSchemaClient.attach = function (app) {
  return app.get('schema.differ')
    .then(function (differ) {
      return function (namespace) {
        return new PostgresqlSchemaClient(differ, namespace);
      };
    });
};
PostgresqlSchemaClient.prototype = Object.create(SchemaClient.prototype);

PostgresqlSchemaClient.prototype.getSchemaVersions = function(snapshotVersion) {
  var client = this.adapter.getClient('schema');

  return client.table('snapshots')
    .select('schema_key,schema_version')
    .where({snapshot_version: snapshotVersion})
    .get();
};

PostgresqlSchemaClient.prototype.putSchemaVersions = function(snapshotVersion, schemaVersions) {
  var client = this.adapter.getClient('schema');

  return client.table('snapshots')
    .select('schema_key,schema_version')
    .where({snapshot_version: snapshotVersion})
    .get();
};

PostgresqlSchemaClient.prototype.getLog = function() {
};

PostgresqlSchemaClient.prototype.log = function(changes) {
};

PostgresqlSchemaClient.prototype.getSchema = function(schemaKey, schemaVersion) {
};

PostgresqlSchemaClient.prototype.putSchema = function(schemaKey, schemaVersion, schema) {
};

PostgresqlSchemaClient.prototype.getSnapshot = function(snapshotVersion) {
};

PostgresqlSchemaClient.prototype.putSnapshot = function(snapshotVersion, snapshot) {
};

module.exports = PostgresqlSchemaClient;
