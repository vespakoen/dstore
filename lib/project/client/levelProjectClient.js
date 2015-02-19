'use strict';

var _ = require('underscore');
var uuid = require('node-uuid');
var BBPromise = require('bluebird');
var ProjectClient = require('./projectClient');

function LevelProjectClient(differ, projectId, adapter) {
  ProjectClient.call(this, differ);
  this.projectId = projectId;
  this.adapter = adapter;
}

LevelProjectClient.prototype = Object.create(ProjectClient.prototype);
LevelProjectClient.prototype.constructor = LevelProjectClient;

LevelProjectClient.attachKey = 'project.client.level';

LevelProjectClient.attach = function (app) {
  return BBPromise.join(
    app.get('project.blueprint.differ'),
    app.get('storage.level.adapter')
  )
  .spread(function (differ, adapter) {
    return function (projectId) {
      return new LevelProjectClient(differ, projectId, adapter);
    };
  });
};

LevelProjectClient.prototype.getLog = function() {
  var client = this.adapter.getClient('projector', 1);
  var sublevel = client.sublevel('log');
  return BBPromise.promisify(sublevel.get)(this.projectId)
    .then(function (result) {
      return JSON.parse(result);
    })
    .catch(function () { return null; });
};

LevelProjectClient.prototype.log = function(changes) {
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

LevelProjectClient.prototype.getBlueprint = function(projectVersion, blueprintId) {
  return this.getSnapshot(projectVersion)
    .then(function (snapshot) {
      if ( ! snapshot || ! snapshot[blueprintId]) {
        throw new Error("Blueprint '" + blueprintId + "' not found for version " + projectVersion + ".");
      }
      return snapshot[blueprintId];
    });
};

LevelProjectClient.prototype.putBlueprint = function(projectVersion, blueprintId, blueprint) {
  var self = this;

  return this.getSnapshot(projectVersion)
    .then(function (snapshot) {
      snapshot = snapshot || {};
      snapshot[blueprintId] = blueprint;
      return self.putSnapshot(projectVersion, snapshot);
    });
};

LevelProjectClient.prototype.getSnapshot = function(projectVersion) {
  var client = this.adapter.getClient('projector', 1);
  var sublevel = client.sublevel('snapshots');
  return BBPromise.promisify(sublevel.get)(this.projectId + projectVersion)
    .then(function (result) {
      return JSON.parse(result);
    })
    .catch(function () { return null; });
};

LevelProjectClient.prototype.putSnapshot = function(projectVersion, snapshot) {
  var self = this;
  var client = this.adapter.getClient('projector', 1);
  var sublevel = client.sublevel('snapshots');
  return BBPromise.promisify(sublevel.put)(this.projectId + projectVersion, JSON.stringify(snapshot))
    .then(function () {
      return self.getSnapshot(projectVersion);
    });
};

LevelProjectClient.prototype.getSnapshotVersions = function() {
  var client = this.adapter.getClient('projector', 1);
  return BBPromise.promisify(client.get)('versions')
    .then(function (result) {
      return JSON.parse(result);
    })
    .catch(function () { return null; });
};

LevelProjectClient.prototype.putSnapshotVersions = function(projectVersions) {
  var client = this.adapter.getClient('projector', 1);
  return BBPromise.promisify(client.put)('versions', JSON.stringify(projectVersions));
};

module.exports = LevelProjectClient;
