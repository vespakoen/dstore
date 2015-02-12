'use strict';

var _ = require('underscore');
var uuid = require('node-uuid');
var BBPromise = require('bluebird');
var BlueprintClient = require('../blueprintClient');

function PostgresqlBlueprintClient(differ, namespace, adapter) {
  BlueprintClient.call(this, differ);
  this.namespace = namespace;
  this.adapter = adapter;
}

PostgresqlBlueprintClient.prototype = Object.create(BlueprintClient.prototype);
PostgresqlBlueprintClient.prototype.constructor = PostgresqlBlueprintClient;

PostgresqlBlueprintClient.attachKey = 'blueprint.client';

PostgresqlBlueprintClient.attach = function (app) {
  return BBPromise.join(
    app.get('blueprint.differ'),
    app.get('postgresql.adapter')
  )
  .spread(function (differ, adapter) {
    return function (namespace) {
      return new PostgresqlBlueprintClient(differ, namespace, adapter);
    };
  });
};

PostgresqlBlueprintClient.prototype.getLog = function() {
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

PostgresqlBlueprintClient.prototype.log = function(changes) {
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

PostgresqlBlueprintClient.prototype.getBlueprint = function(snapshotVersion, blueprintKey) {
  return this.getSnapshot(snapshotVersion)
    .then(function (snapshot) {
      if ( ! snapshot || ! snapshot[blueprintKey]) {
        throw new Error("Blueprint '" + blueprintKey + "' not found for version " + snapshotVersion + ".");
      }
      return snapshot[blueprintKey];
    });
};

PostgresqlBlueprintClient.prototype.putBlueprint = function(snapshotVersion, blueprintKey, blueprint) {
  var self = this;

  return this.getSnapshot(snapshotVersion)
    .then(function (snapshot) {
      snapshot = snapshot || {};
      snapshot[blueprintKey] = blueprint;
      return self.putSnapshot(snapshotVersion, snapshot);
    });
};

PostgresqlBlueprintClient.prototype.getSnapshot = function(snapshotVersion) {
  var client = this.adapter.getClient('projector', 1);
  return client.table('snapshots')
    .first()
    .where({
      namespace: this.namespace,
      version: snapshotVersion
    })
    .then(function (record) {
      return record ? record.blueprints : null;
    });
};

PostgresqlBlueprintClient.prototype.putSnapshot = function(snapshotVersion, snapshot) {
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
            blueprints: snapshot
          })
          .then(function () {});
      } else {
        return client.table('snapshots')
          .where({
            namespace: self.namespace,
            version: snapshotVersion
          })
          .update({
            blueprints: snapshot
          })
          .then(function () {});
      }
    });
};

PostgresqlBlueprintClient.prototype.getSnapshotVersions = function() {
  var client = this.adapter.getClient('projector', 1);
  return client.table('versions')
    .then(function () {});
};

PostgresqlBlueprintClient.prototype.putSnapshotVersions = function(snapshotVersions) {
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

module.exports = PostgresqlBlueprintClient;
