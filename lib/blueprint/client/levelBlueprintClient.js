'use strict';

var _ = require('underscore');
var uuid = require('node-uuid');
var BBPromise = require('bluebird');
var BlueprintClient = require('../blueprintClient');

function LevelBlueprintClient(differ, projectId, adapter) {
  BlueprintClient.call(this, differ);
  this.projectId = projectId;
  this.adapter = adapter;
}

LevelBlueprintClient.prototype = Object.create(BlueprintClient.prototype);
LevelBlueprintClient.prototype.constructor = LevelBlueprintClient;

LevelBlueprintClient.attachKey = 'blueprint.client';

LevelBlueprintClient.attach = function (app) {
  return BBPromise.join(
    app.get('blueprint.differ'),
    app.get('level.adapter')
  )
  .spread(function (differ, adapter) {
    return function (projectId) {
      return new LevelBlueprintClient(differ, projectId, adapter);
    };
  });
};

LevelBlueprintClient.prototype.getLog = function() {
  var client = this.adapter.getClient('projector', 1);
  var sublevel = client.sublevel('log');
  return BBPromise.promisify(sublevel.get)(this.projectId)
    .then(function (result) {
      return JSON.parse(result);
    })
    .catch(function () { return null; });
};

LevelBlueprintClient.prototype.log = function(changes) {
  var self = this;
  var client = this.adapter.getClient('projector', 1);
  return this.getLog()
    .then(function(currentChanges) {
      currentChanges = currentChanges || [];
      currentChanges = currentChanges.concat(changes);
      var sublevel = client.sublevel('log');
      return BBPromise.promisify(sublevel.put)(self.projectId, JSON.stringify(currentChanges));
    });
};

LevelBlueprintClient.prototype.getBlueprint = function(snapshotVersion, blueprintId) {
  return this.getSnapshot(snapshotVersion)
    .then(function (snapshot) {
      if ( ! snapshot || ! snapshot[blueprintId]) {
        throw new Error("Blueprint '" + blueprintId + "' not found for version " + snapshotVersion + ".");
      }
      return snapshot[blueprintId];
    });
};

LevelBlueprintClient.prototype.putBlueprint = function(snapshotVersion, blueprintId, blueprint) {
  var self = this;

  return this.getSnapshot(snapshotVersion)
    .then(function (snapshot) {
      snapshot = snapshot || {};
      snapshot[blueprintId] = blueprint;
      return self.putSnapshot(snapshotVersion, snapshot);
    });
};

LevelBlueprintClient.prototype.getSnapshot = function(snapshotVersion) {
  var client = this.adapter.getClient('projector', 1);
  var sublevel = client.sublevel('snapshots');
  return BBPromise.promisify(sublevel.get)(this.projectId + snapshotVersion)
    .then(function (result) {
      return JSON.parse(result);
    })
    .catch(function () { return null; });
};

LevelBlueprintClient.prototype.putSnapshot = function(snapshotVersion, snapshot) {
  var self = this;
  var client = this.adapter.getClient('projector', 1);
  var sublevel = client.sublevel('snapshots');
  return BBPromise.promisify(sublevel.put)(this.projectId + snapshotVersion, JSON.stringify(snapshot))
    .then(function () {
      return self.getSnapshot(snapshotVersion);
    });
};

LevelBlueprintClient.prototype.getSnapshotVersions = function() {
  var client = this.adapter.getClient('projector', 1);
  return BBPromise.promisify(client.get)('versions')
    .then(function (result) {
      return JSON.parse(result);
    })
    .catch(function () { return null; });
};

LevelBlueprintClient.prototype.putSnapshotVersions = function(snapshotVersions) {
  var client = this.adapter.getClient('projector', 1);
  return BBPromise.promisify(client.put)('versions', JSON.stringify(snapshotVersions));
};

module.exports = LevelBlueprintClient;
