'use strict';

var _ = require('underscore');
var uuid = require('node-uuid');
var BBPromise = require('bluebird');
var SchemaClient = require('../schemaClient');

function LevelSchemaClient(differ, namespace, adapter) {
  SchemaClient.call(this, differ);
  this.namespace = namespace;
  this.adapter = adapter;
}

LevelSchemaClient.prototype = Object.create(SchemaClient.prototype);
LevelSchemaClient.prototype.constructor = LevelSchemaClient;

LevelSchemaClient.attachKey = 'schema.client';

LevelSchemaClient.attach = function (app) {
  return BBPromise.join(
    app.get('schema.differ'),
    app.get('level.adapter')
  )
  .spread(function (differ, adapter) {
    return function (namespace) {
      return new LevelSchemaClient(differ, namespace, adapter);
    };
  });
};

LevelSchemaClient.prototype.getLog = function() {
  var client = this.adapter.getClient('projector', 1);
  var sublevel = client.sublevel('log');
  return BBPromise.promisify(sublevel.get)(this.namespace)
    .then(function (result) {
      return JSON.parse(result);
    })
    .catch(function () { return null; });
};

LevelSchemaClient.prototype.log = function(changes) {
  var self = this;
  var client = this.adapter.getClient('projector', 1);
  return this.getLog()
    .then(function(currentChanges) {
      currentChanges = currentChanges || [];
      currentChanges = currentChanges.concat(changes);
      var sublevel = client.sublevel('log');
      return BBPromise.promisify(sublevel.put)(self.namespace, JSON.stringify(currentChanges));
    });
};

LevelSchemaClient.prototype.getSchema = function(snapshotVersion, schemaKey) {
  return this.getSnapshot(snapshotVersion)
    .then(function (snapshot) {
      if ( ! snapshot || ! snapshot[schemaKey]) {
        throw new Error("Schema '" + schemaKey + "' not found for version " + snapshotVersion + ".");
      }
      return snapshot[schemaKey];
    });
};

LevelSchemaClient.prototype.putSchema = function(snapshotVersion, schemaKey, schema) {
  var self = this;

  return this.getSnapshot(snapshotVersion)
    .then(function (snapshot) {
      snapshot = snapshot || {};
      snapshot[schemaKey] = schema;
      return self.putSnapshot(snapshotVersion, snapshot);
    });
};

LevelSchemaClient.prototype.getSnapshot = function(snapshotVersion) {
  var client = this.adapter.getClient('projector', 1);
  var sublevel = client.sublevel('snapshots');
  return BBPromise.promisify(sublevel.get)(this.namespace + snapshotVersion)
    .then(function (result) {
      return JSON.parse(result);
    })
    .catch(function () { return null; });
};

LevelSchemaClient.prototype.putSnapshot = function(snapshotVersion, snapshot) {
  var self = this;
  var client = this.adapter.getClient('projector', 1);
  var sublevel = client.sublevel('snapshots');
  return BBPromise.promisify(sublevel.put)(this.namespace + snapshotVersion, JSON.stringify(snapshot))
    .then(function () {
      return self.getSnapshot(snapshotVersion);
    });
};

LevelSchemaClient.prototype.getSnapshotVersions = function() {
  var client = this.adapter.getClient('projector', 1);
  return BBPromise.promisify(client.get)('versions')
    .then(function (result) {
      return JSON.parse(result);
    })
    .catch(function () { return null; });
};

LevelSchemaClient.prototype.putSnapshotVersions = function(snapshotVersions) {
  var client = this.adapter.getClient('projector', 1);
  return BBPromise.promisify(client.put)('versions', JSON.stringify(snapshotVersions));
};

module.exports = LevelSchemaClient;
