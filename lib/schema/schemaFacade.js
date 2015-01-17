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

SchemaFacade.prototype.getSchema = function(namespace, schemaKey) {
  return this.service.getSchema(namespace, schemaKey);
};

SchemaFacade.prototype.getAllSchemas = function(namespace) {
  return this.service.getAllSchemas(namespace);
};

SchemaFacade.prototype.putSchema = function(namespace, schemaKey, schema) {
  return this.service.putSchema(namespace, schemaKey, schema);
};

SchemaFacade.prototype.putAllSchemas = function(namespace, schemas) {
  return this.service.putAllSchemas(namespace, schemas);
};

SchemaFacade.prototype.createSnapshot = function(namespace) {
  return this.snapshotter.createSnapshot(namespace);
};

SchemaFacade.prototype.diff = function(schemaKey, from, to) {
  return this.differ.diff(schemaKey, from, to);
};

module.exports = SchemaFacade;
