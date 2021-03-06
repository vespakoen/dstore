'use strict';

var fs = require('fs');
var p = require('path');
var BBPromise = require('bluebird');
var mkdirp = BBPromise.promisify(require('mkdirp'));
var ProjectClient = require('./projectClient');
var rmRF = BBPromise.promisify(require('rimraf'));

BBPromise.promisifyAll(fs);

function FileProjectClient(differ, path) {
  ProjectClient.call(this, differ);
  this.path = path;
}

FileProjectClient.prototype = Object.create(ProjectClient.prototype);
FileProjectClient.prototype.constructor = FileProjectClient;

FileProjectClient.attachKey = 'project.client.file';

FileProjectClient.attach = function (app) {
  var path = app.config.project.file.path;
  return app.get('project.blueprint.differ')
    .then(function (differ) {
      return new FileProjectClient(differ, path);
    });
};

FileProjectClient.prototype.getLog = function(projectId) {
  var path = this._getPathToLog(projectId);
  return this._getJsonFile(path);
};

FileProjectClient.prototype.log = function(projectId, changes) {
  return this.getLog(projectId)
    .then(function(currentChanges) {
      currentChanges = currentChanges || [];
      currentChanges = currentChanges.concat(changes);
      return currentChanges;
    }).then(function(changes) {
      var path = this._getPathToLog(projectId);
      return this._putJsonFile(path, changes);
    }.bind(this));
};

FileProjectClient.prototype.delProject = function(projectId) {
  var self = this;

  return this.getAllProjectVersions()
    // remove from versions
    .then(function (projectVersions) {
      projectVersions = projectVersions || {};
      delete projectVersions[projectId];
      return self.putAllProjectVersions(projectVersions);
    })
    // remove project directory
    .then(function () {
      return rmRF(self.path + '/' + projectId);
    });
};

FileProjectClient.prototype.getAllBlueprints = function(projectId, projectVersion) {
  var path = this._getPathToBlueprints(projectId, projectVersion);
  return this._getJsonFile(path);
};

FileProjectClient.prototype.putAllBlueprints = function(projectId, projectVersion, blueprints) {
  var path = this._getPathToBlueprints(projectId, projectVersion);
  return this._putJsonFile(path, blueprints);
};

FileProjectClient.prototype.getAllProjectVersions = function() {
  var path = this._getPathToAllProjectVersions();
  return this._getJsonFile(path);
};

FileProjectClient.prototype.putAllProjectVersions = function(projectVersions) {
  var path = this._getPathToAllProjectVersions();
  return this._putJsonFile(path, projectVersions);
};

FileProjectClient.prototype._getJsonFile = function(path) {
  var that = this;
  return new BBPromise(function(resolve) {
    fs.exists(path, function(exists) {
      if (exists) {
        return resolve(
          fs.readFileAsync(path)
            .then(that._bufferToJson)
        );
      }
      resolve(false);
    });
  });
};

FileProjectClient.prototype._bufferToJson = function(buffer) {
  try {
    return JSON.parse(buffer.toString());
  } catch (e) {
    return false;
  }
};

FileProjectClient.prototype._putJsonFile = function(path, data) {
  return mkdirp(p.dirname(path))
    .then(function() {
      return fs.writeFileAsync(path, JSON.stringify(data, undefined, 2));
    });
};

FileProjectClient.prototype._getPathToLog = function(projectId) {
  var blueprintPath = this.path + '/' + projectId;
  return blueprintPath + '/log.json';
};

FileProjectClient.prototype._getPathToBlueprints = function(projectId, projectVersion) {
  var blueprintPath = this.path + '/' + projectId;
  return blueprintPath + '/blueprints/' + projectVersion + '.json';
};

FileProjectClient.prototype._getPathToAllProjectVersions = function () {
  return this.path + '/versions.json';
};

module.exports = FileProjectClient;
