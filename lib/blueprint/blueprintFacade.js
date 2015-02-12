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

BlueprintFacade.prototype.getBlueprint = function(namespace, blueprintKey, snapshotVersion) {
  return this.service.getBlueprint(namespace, blueprintKey, snapshotVersion);
};

BlueprintFacade.prototype.putBlueprint = function(namespace, blueprintKey, blueprint) {
  return this.service.putBlueprint(namespace, blueprintKey, blueprint);
};

BlueprintFacade.prototype.getSnapshotVersions = function () {
  return this.service.getSnapshotVersions();
};

BlueprintFacade.prototype.getSnapshot = function(namespace, snapshotVersion) {
  return this.service.getSnapshot(namespace, snapshotVersion);
};

BlueprintFacade.prototype.putSnapshot = function(namespace, snapshotVersion) {
  return this.service.putSnapshot(namespace, snapshotVersion);
};

BlueprintFacade.prototype.createSnapshot = function(namespace) {
  return this.snapshotter.createSnapshot(namespace);
};

BlueprintFacade.prototype.diff = function(blueprintKey, from, to) {
  return this.differ.diff(blueprintKey, from, to);
};

module.exports = BlueprintFacade;
