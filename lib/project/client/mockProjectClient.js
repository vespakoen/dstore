'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var ProjectClient = require('./projectClient');

function MockProjectClient(differ) {
  ProjectClient.call(this, differ);
  this.files = {};
}

MockProjectClient.prototype = Object.create(ProjectClient.prototype);
MockProjectClient.prototype.constructor = MockProjectClient;

MockProjectClient.attachKey = 'project.client.mock';

var mockClient = null;
MockProjectClient.attach = function (app) {
  return app.get('project.blueprint.differ')
    .then(function (differ) {
      if ( ! mockClient) {
        mockClient = new MockProjectClient(differ);
      }
      return mockClient;
    });
};

MockProjectClient.prototype.getLog = function(projectId) {
  var path = this._getPathToLog(projectId);
  return this._getJsonFile(path);
};

MockProjectClient.prototype.log = function(projectId, changes) {
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

MockProjectClient.prototype.delProject = function(projectId) {
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
      this.files = _.filter(this.files, function  (file) {
        if (file.substr(0, projectId.length) === projectId) {
          return false;
        }
        return true;
      });
    });
};

MockProjectClient.prototype.getAllBlueprints = function(projectId, projectVersion) {
  var path = this._getPathToBlueprints(projectId, projectVersion);
  return this._getJsonFile(path);
};

MockProjectClient.prototype.putAllBlueprints = function(projectId, projectVersion, blueprints) {
  var path = this._getPathToBlueprints(projectId, projectVersion);
  return this._putJsonFile(path, blueprints);
};

MockProjectClient.prototype.getAllProjectVersions = function() {
  var path = this._getPathToAllProjectVersions();
  return this._getJsonFile(path);
};

MockProjectClient.prototype.putAllProjectVersions = function(projectVersions) {
  var path = this._getPathToAllProjectVersions();
  return this._putJsonFile(path, projectVersions);
};

MockProjectClient.prototype._getJsonFile = function(path) {
  return BBPromise.resolve(this.files[path] ? this.files[path] : false);
};

MockProjectClient.prototype._putJsonFile = function(path, data) {
  this.files[path] = data;
  return BBPromise.resolve();
};

MockProjectClient.prototype._getPathToLog = function(projectId) {
  return projectId + '/log.json';
};

MockProjectClient.prototype._getPathToBlueprints = function(projectId, projectVersion) {
  return projectId + '/blueprints/' + projectVersion + '.json';
};

MockProjectClient.prototype._getPathToAllProjectVersions = function () {
  return 'versions.json';
};

module.exports = MockProjectClient;
