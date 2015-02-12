'use strict';

var fs = require('fs');
var p = require('path');
var BBPromise = require('bluebird');
var mkdirp = BBPromise.promisify(require('mkdirp'));
var BlueprintClient = require('../blueprintClient');
BBPromise.promisifyAll(fs);

function FileBlueprintClient(differ, path, namespace) {
  BlueprintClient.call(this, differ);
  this.path = path;
  this.blueprintPath = path + '/' + namespace;
}

FileBlueprintClient.prototype = Object.create(BlueprintClient.prototype);
FileBlueprintClient.prototype.constructor = FileBlueprintClient;

FileBlueprintClient.attachKey = 'blueprint.client';

FileBlueprintClient.attach = function (app) {
  var path = app.config.blueprint.path;
  return app.get('blueprint.differ')
    .then(function (differ) {
      return function (namespace) {
        return new FileBlueprintClient(differ, path, namespace);
      };
    });
};

FileBlueprintClient.prototype.getLog = function() {
  var path = this._getPathToLog();
  return this._getJsonFile(path);
};

FileBlueprintClient.prototype.log = function(changes) {
  return this.getLog().then(function(currentChanges) {
    currentChanges = currentChanges || [];
    currentChanges = currentChanges.concat(changes);
    return currentChanges;
  }).then(function(changes) {
    var path = this._getPathToLog();
    return this._putJsonFile(path, changes);
  }.bind(this));
};

FileBlueprintClient.prototype.getBlueprint = function(snapshotVersion, blueprintKey) {
  return this.getSnapshot(snapshotVersion)
    .then(function (snapshot) {
      if ( ! snapshot || ! snapshot[blueprintKey]) {
        throw new Error("Blueprint '" + blueprintKey + "' not found for version " + snapshotVersion + ".");
      }
      return snapshot[blueprintKey];
    });
};

FileBlueprintClient.prototype.putBlueprint = function(snapshotVersion, blueprintKey, blueprint) {
  var self = this;

  return this.getSnapshot(snapshotVersion)
    .then(function (snapshot) {
      snapshot = snapshot || {};
      snapshot[blueprintKey] = blueprint;
      return self.putSnapshot(snapshotVersion, snapshot);
    });
};

FileBlueprintClient.prototype.getSnapshot = function(snapshotVersion) {
  var path = this._getPathToSnapshot(snapshotVersion);
  return this._getJsonFile(path);
};

FileBlueprintClient.prototype.putSnapshot = function(snapshotVersion, snapshot) {
  var path = this._getPathToSnapshot(snapshotVersion);
  return this._putJsonFile(path, snapshot);
};

FileBlueprintClient.prototype.getSnapshotVersions = function() {
  var path = this._getPathToSnapshotVersions();
  return this._getJsonFile(path);
};

FileBlueprintClient.prototype.putSnapshotVersions = function(snapshotVersions) {
  var path = this._getPathToSnapshotVersions();
  return this._putJsonFile(path, snapshotVersions);
};

FileBlueprintClient.prototype._getJsonFile = function(path) {
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

FileBlueprintClient.prototype._bufferToJson = function(buffer) {
  try {
    return JSON.parse(buffer.toString());
  } catch (e) {
    return false;
  }
};

FileBlueprintClient.prototype._putJsonFile = function(path, data) {
  return mkdirp(p.dirname(path)).then(function() {
    return fs.writeFileAsync(path, JSON.stringify(data, undefined, 2));
  });
};

FileBlueprintClient.prototype._getPathToLog = function() {
  return this.blueprintPath + '/log.json';
};

FileBlueprintClient.prototype._getPathToSnapshot = function(snapshotVersion) {
  return this.blueprintPath + '/snapshots/' + snapshotVersion + '.json';
};

FileBlueprintClient.prototype._getPathToSnapshotVersions = function () {
  return this.path + '/versions.json';
};

module.exports = FileBlueprintClient;
