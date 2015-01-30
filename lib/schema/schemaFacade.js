'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');

function SchemaFacade(service, snapshotter, differ) {
  this.service = service;
  this.snapshotter = snapshotter;
  this.differ = differ;
}

////////////////////////////////////////////////////////////////////
///////////////////////// STATIC PROPERTIES ////////////////////////
////////////////////////////////////////////////////////////////////

SchemaFacade.attachKey = 'schema.facade';

SchemaFacade.attach = function(app) {
  return BBPromise.join(
    app.get('schema.service'),
    app.get('schema.snapshotter'),
    app.get('schema.differ')
  ).spread(function(service, snapshotter, differ) {
    return new SchemaFacade(service, snapshotter, differ);
  });
};

////////////////////////////////////////////////////////////////////
///////////////////////// INSTANCE METHODS /////////////////////////
////////////////////////////////////////////////////////////////////

SchemaFacade.prototype.getSchema = function(namespace, schemaKey, snapshotVersion) {
  return this.service.getSchema(namespace, schemaKey, snapshotVersion);
};

SchemaFacade.prototype.putSchema = function(namespace, schemaKey, schema) {
  return this.service.putSchema(namespace, schemaKey, schema);
};

SchemaFacade.prototype.getSnapshotVersions = function () {
  return this.service.getSnapshotVersions();
};

SchemaFacade.prototype.getSnapshot = function(namespace, snapshotVersion) {
  return this.service.getSnapshot(namespace, snapshotVersion);
};

SchemaFacade.prototype.putSnapshot = function(namespace, snapshotVersion) {
  return this.service.putSnapshot(namespace, snapshotVersion);
};

SchemaFacade.prototype.createSnapshot = function(namespace) {
  return this.snapshotter.createSnapshot(namespace);
};

SchemaFacade.prototype.diff = function(schemaKey, from, to) {
  return this.differ.diff(schemaKey, from, to);
};

module.exports = SchemaFacade;
