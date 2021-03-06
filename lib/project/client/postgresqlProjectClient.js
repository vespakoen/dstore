'use strict';

var _ = require('underscore');
var uuid = require('node-uuid');
var BBPromise = require('bluebird');
var ProjectClient = require('./projectClient');

function PostgresqlProjectClient(differ, projectId, adapter) {
  ProjectClient.call(this, differ);
  this.projectId = projectId;
  this.adapter = adapter;
}

PostgresqlProjectClient.prototype = Object.create(ProjectClient.prototype);
PostgresqlProjectClient.prototype.constructor = PostgresqlProjectClient;

PostgresqlProjectClient.attachKey = 'project.client.postgresql';

PostgresqlProjectClient.attach = function (app) {
  return BBPromise.join(
    app.get('project.blueprint.differ'),
    app.get('storage.postgresql.adapter')
  )
  .spread(function (differ, adapter) {
    return function (projectId) {
      return new PostgresqlProjectClient(differ, projectId, adapter);
    };
  });
};

PostgresqlProjectClient.prototype.getLog = function() {
  var client = this.adapter.getClient('dstore', 1);
  return client.table('log')
    .first()
    .where({
      project_id: this.projectId
    })
    .then(function (record) {
      return record ? record.log || [] : null;
    });
};

PostgresqlProjectClient.prototype.log = function(changes) {
  var self = this;
  var client = this.adapter.getClient('dstore', 1);
  return this.getLog()
    .then(function(currentChanges) {
      if ( ! currentChanges) {
        return client.table('log')
          .insert({
            id: uuid.v4(),
            project_id: self.projectId,
            log: changes
          })
          .then(function () {});
      } else {
        return client.table('log')
          .where({
            project_id: self.projectId
          })
          .update({
            log: currentChanges.concat(changes)
          })
          .then(function () {});
      }
    });
};

PostgresqlProjectClient.prototype.getBlueprint = function(projectVersion, blueprintId) {
  return this.getSnapshot(projectVersion)
    .then(function (snapshot) {
      if ( ! snapshot || ! snapshot[blueprintId]) {
        throw new Error("Blueprint '" + blueprintId + "' not found for version " + projectVersion + ".");
      }
      return snapshot[blueprintId];
    });
};

PostgresqlProjectClient.prototype.putBlueprint = function(projectVersion, blueprintId, blueprint) {
  var self = this;

  return this.getSnapshot(projectVersion)
    .then(function (snapshot) {
      snapshot = snapshot || {};
      snapshot[blueprintId] = blueprint;
      return self.putSnapshot(projectVersion, snapshot);
    });
};

PostgresqlProjectClient.prototype.getSnapshot = function(projectVersion) {
  var client = this.adapter.getClient('dstore', 1);
  return client.table('snapshots')
    .first()
    .where({
      project_id: this.projectId,
      version: projectVersion
    })
    .then(function (record) {
      return record ? record.blueprints : null;
    });
};

PostgresqlProjectClient.prototype.putSnapshot = function(projectVersion, snapshot) {
  var self = this;
  var client = this.adapter.getClient('dstore', 1);

  return this.getSnapshot(projectVersion)
    .then(function (res) {
      if (res === null) {
        return client.table('snapshots')
          .insert({
            id: uuid.v4(),
            project_version: 1,
            project_id: self.projectId,
            version: projectVersion,
            blueprints: snapshot
          })
          .then(function () {});
      } else {
        return client.table('snapshots')
          .where({
            project_id: self.projectId,
            version: projectVersion
          })
          .update({
            blueprints: snapshot
          })
          .then(function () {});
      }
    });
};

PostgresqlProjectClient.prototype.getSnapshotVersions = function() {
  var client = this.adapter.getClient('dstore', 1);
  return client.table('versions')
    .then(function () {});
};

PostgresqlProjectClient.prototype.putSnapshotVersions = function(projectVersions) {
  var client = this.adapter.getClient('dstore', 1);
  return client.table('versions')
    .del()
    .then(function (record) {
      return client.table('versions')
        .insert(_.map(projectVersions, function (version, projectId) {
          return {
            id: uuid.v4(),
            project_version: 1,
            version: version,
            project_id: projectId
          };
        }))
        .then(function () {});
    });
};

module.exports = PostgresqlProjectClient;
