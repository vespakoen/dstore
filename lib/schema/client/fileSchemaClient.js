'use strict';

var fs = require('fs');
var p = require('path');
var BBPromise = require('bluebird');
var mkdirp = BBPromise.promisify(require('mkdirp'));
var SchemaClient = require('../schemaClient');
BBPromise.promisifyAll(fs);

function FileSchemaClient(differ, path, namespace) {
  SchemaClient.call(this, differ);
  this.path = path;
  this.schemaPath = path + '/' + namespace;
}

FileSchemaClient.prototype = Object.create(SchemaClient.prototype);
FileSchemaClient.prototype.constructor = FileSchemaClient;

FileSchemaClient.attachKey = 'schema.client';

FileSchemaClient.attach = function (app) {
  var path = app.config.schema.path;
  return app.get('schema.differ')
    .then(function (differ) {
      return function (namespace) {
        return new FileSchemaClient(differ, path, namespace);
      };
    });
};

FileSchemaClient.prototype.getLog = function() {
  var path = this._getPathToLog();
  return this._getJsonFile(path);
};

FileSchemaClient.prototype.log = function(changes) {
  return this.getLog().then(function(currentChanges) {
    currentChanges = currentChanges || [];
    currentChanges = currentChanges.concat(changes);
    return currentChanges;
  }).then(function(changes) {
    var path = this._getPathToLog();
    return this._putJsonFile(path, changes);
  }.bind(this));
};

FileSchemaClient.prototype.getSchema = function(snapshotVersion, schemaKey) {
  return this.getSnapshot(snapshotVersion)
    .then(function (snapshot) {
      if ( ! snapshot || ! snapshot[schemaKey]) {
        throw new Error("Schema '" + schemaKey + "' not found for version " + snapshotVersion + ".");
      }
      return snapshot[schemaKey];
    });
};

FileSchemaClient.prototype.putSchema = function(snapshotVersion, schemaKey, schema) {
  var self = this;

  return this.getSnapshot(snapshotVersion)
    .then(function (snapshot) {
      snapshot = snapshot || {};
      snapshot[schemaKey] = schema;
      return self.putSnapshot(snapshotVersion, snapshot);
    });
};

FileSchemaClient.prototype.getSnapshot = function(snapshotVersion) {
  var path = this._getPathToSnapshot(snapshotVersion);
  return this._getJsonFile(path);
};

FileSchemaClient.prototype.putSnapshot = function(snapshotVersion, snapshot) {
  var path = this._getPathToSnapshot(snapshotVersion);
  return this._putJsonFile(path, snapshot);
};

FileSchemaClient.prototype.getSnapshotVersions = function() {
  var path = this._getPathToSnapshotVersions();
  return this._getJsonFile(path);
};

FileSchemaClient.prototype.putSnapshotVersions = function(snapshotVersions) {
  var path = this._getPathToSnapshotVersions();
  return this._putJsonFile(path, snapshotVersions);
};

FileSchemaClient.prototype._getJsonFile = function(path) {
  var that = this;
  return new BBPromise(function(resolve) {
    fs.exists(path, function(exists) {
      if (exists) {
        return resolve(fs.readFileAsync(path).then(that._bufferToJson));
      }
      resolve(false);
    });
  });
};

FileSchemaClient.prototype._bufferToJson = function(buffer) {
  try {
    return JSON.parse(buffer.toString());
  } catch (e) {
    return false;
  }
};

FileSchemaClient.prototype._putJsonFile = function(path, data) {
  return mkdirp(p.dirname(path)).then(function() {
    return fs.writeFileAsync(path, JSON.stringify(data, undefined, 2));
  });
};

FileSchemaClient.prototype._getPathToLog = function() {
  return this.schemaPath + '/log.json';
};

FileSchemaClient.prototype._getPathToSnapshot = function(snapshotVersion) {
  return this.schemaPath + '/snapshots/' + snapshotVersion + '.json';
};

FileSchemaClient.prototype._getPathToSnapshotVersions = function () {
  return this.path + '/versions.json';
};

module.exports = FileSchemaClient;
