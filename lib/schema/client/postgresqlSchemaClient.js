'use strict';

var _ = require('underscore');
var uuid = require('node-uuid');
var BBPromise = require('bluebird');
var SchemaClient = require('../schemaClient');

function PostgresqlSchemaClient(differ, namespace, adapter) {
  SchemaClient.call(this, differ);
  this.namespace = namespace;
  this.adapter = adapter;
}

PostgresqlSchemaClient.prototype = Object.create(SchemaClient.prototype);
PostgresqlSchemaClient.prototype.constructor = PostgresqlSchemaClient;

PostgresqlSchemaClient.attachKey = 'schema.client';

PostgresqlSchemaClient.attach = function (app) {
  return BBPromise.join(
    app.get('schema.differ'),
    app.get('postgresql.adapter')
  )
  .spread(function (differ, adapter) {
    return function (namespace) {
      return new PostgresqlSchemaClient(differ, namespace, adapter);
    };
  });
};

PostgresqlSchemaClient.prototype.getLog = function() {
  var client = this.adapter.getClient('projector', 1);
  return client.table('log')
    .first()
    .where({
      namespace: this.namespace
    })
    .then(function (record) {
      return record ? record.log || [] : null;
    });
};

PostgresqlSchemaClient.prototype.log = function(changes) {
  var self = this;
  var client = this.adapter.getClient('projector', 1);
  return this.getLog()
    .then(function(currentChanges) {
      if ( ! currentChanges) {
        return client.table('log')
          .insert({
            id: uuid.v4(),
            namespace: self.namespace,
            log: changes
          })
          .then(function () {});
      } else {
        return client.table('log')
          .where({
            namespace: self.namespace
          })
          .update({
            log: currentChanges.concat(changes)
          })
          .then(function () {});
      }
    });
};

PostgresqlSchemaClient.prototype.getSchema = function(snapshotVersion, schemaKey) {
  return this.getSnapshot(snapshotVersion)
    .then(function (snapshot) {
      if ( ! snapshot || ! snapshot[schemaKey]) {
        throw new Error("Schema '" + schemaKey + "' not found for version " + snapshotVersion + ".");
      }
      return snapshot[schemaKey];
    });
};

PostgresqlSchemaClient.prototype.putSchema = function(snapshotVersion, schemaKey, schema) {
  var self = this;

  return this.getSnapshot(snapshotVersion)
    .then(function (snapshot) {
      snapshot = snapshot || {};
      snapshot[schemaKey] = schema;
      return self.putSnapshot(snapshotVersion, snapshot);
    });
};

PostgresqlSchemaClient.prototype.getSnapshot = function(snapshotVersion) {
  var client = this.adapter.getClient('projector', 1);
  return client.table('snapshots')
    .first()
    .where({
      namespace: this.namespace,
      version: snapshotVersion
    })
    .then(function (record) {
      return record ? record.schemas : null;
    });
};

PostgresqlSchemaClient.prototype.putSnapshot = function(snapshotVersion, snapshot) {
  var self = this;
  var client = this.adapter.getClient('projector', 1);

  return this.getSnapshot(snapshotVersion)
    .then(function (res) {
      if (res === null) {
        return client.table('snapshots')
          .insert({
            id: uuid.v4(),
            snapshot_version: 1,
            namespace: self.namespace,
            version: snapshotVersion,
            schemas: snapshot
          })
          .then(function () {});
      } else {
        return client.table('snapshots')
          .where({
            namespace: self.namespace,
            version: snapshotVersion
          })
          .update({
            schemas: snapshot
          })
          .then(function () {});
      }
    });
};

PostgresqlSchemaClient.prototype.getSnapshotVersions = function() {
  var client = this.adapter.getClient('projector', 1);
  return client.table('versions')
    .then(function () {});
};

PostgresqlSchemaClient.prototype.putSnapshotVersions = function(snapshotVersions) {
  var client = this.adapter.getClient('projector', 1);
  return client.table('versions')
    .del()
    .then(function (record) {
      return client.table('versions')
        .insert(_.map(snapshotVersions, function (version, namespace) {
          return {
            id: uuid.v4(),
            snapshot_version: 1,
            version: version,
            namespace: namespace
          };
        }))
        .then(function () {});
    });
};

module.exports = PostgresqlSchemaClient;
