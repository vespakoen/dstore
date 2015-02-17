'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');

function BlueprintFacade(service, snapshotter, differ) {
  this.service = service;
  this.snapshotter = snapshotter;
  this.differ = differ;
}

////////////////////////////////////////////////////////////////////
///////////////////////// STATIC PROPERTIES ////////////////////////
////////////////////////////////////////////////////////////////////

BlueprintFacade.attachKey = 'blueprint.facade';

BlueprintFacade.attach = function(app) {
  return BBPromise.join(
    app.get('blueprint.service'),
    app.get('blueprint.snapshotter'),
    app.get('blueprint.differ')
  ).spread(function(service, snapshotter, differ) {
    return new BlueprintFacade(service, snapshotter, differ);
  });
};

////////////////////////////////////////////////////////////////////
///////////////////////// INSTANCE METHODS /////////////////////////
////////////////////////////////////////////////////////////////////

BlueprintFacade.prototype.getBlueprint = function(projectId, blueprintId, snapshotVersion) {
  return this.service.getBlueprint(projectId, blueprintId, snapshotVersion);
};

BlueprintFacade.prototype.getBlueprintVersions = function(projectId, blueprintId) {
  return this.service.getBlueprintVersions(projectId, blueprintId);
};

BlueprintFacade.prototype.putBlueprint = function(projectId, blueprintId, blueprint) {
  return this.service.putBlueprint(projectId, blueprintId, blueprint);
};

BlueprintFacade.prototype.getAllSnapshotVersions = function () {
  return this.service.getAllSnapshotVersions();
};

BlueprintFacade.prototype.getSnapshotVersion = function (projectId) {
  return this.service.getSnapshotVersion(projectId);
};

BlueprintFacade.prototype.getAllBlueprints = function(projectId, snapshotVersion) {
  return this.service.getAllBlueprints(projectId, snapshotVersion);
};

BlueprintFacade.prototype.putSnapshot = function(projectId, snapshotVersion) {
  return this.service.putSnapshot(projectId, snapshotVersion);
};

BlueprintFacade.prototype.createSnapshot = function(projectId) {
  return this.snapshotter.createSnapshot(projectId);
};

BlueprintFacade.prototype.diff = function(blueprintId, from, to) {
  return this.differ.diff(blueprintId, from, to);
};

module.exports = BlueprintFacade;
