'use strict';

var BBPromise = require('bluebird');
var _ = require('underscore');

function ProjectClient(differ) {
  this.differ = differ;
}

ProjectClient.attachKey = 'project.client';

ProjectClient.attach = function (app) {
  return app.get('project.client.' + app.config.project.client);
};

ProjectClient.prototype.getProjectVersion = function(projectId) {
  return this.getAllProjectVersions()
    .then(function (projectVersions) {
      return projectVersions[projectId] || 0;
    });
};

ProjectClient.prototype.putProjectVersion = function(projectId, version) {
  var self = this;
  return this.getAllProjectVersions()
    .then(function (projectVersions) {
      projectVersions = projectVersions || {};
      projectVersions[projectId] = version;
      return self.putAllProjectVersions(projectVersions);
    });
};

ProjectClient.prototype.getBlueprint = function(projectId, blueprintId, projectVersion) {
  return this.getAllBlueprints(projectId, projectVersion)
    .then(function (blueprints) {
      if ( ! blueprints || ! blueprints[blueprintId]) {
        throw new Error("Blueprint '" + blueprintId + "' not found for version " + projectVersion + ".");
      }
      return blueprints[blueprintId];
    });
};

ProjectClient.prototype.putBlueprint = function(projectId, blueprintId, projectVersion, blueprint) {
  var self = this;
  return this.getAllBlueprints(projectId, projectVersion)
    .then(function (blueprints) {
      blueprints = blueprints || {};
      blueprints[blueprintId] = blueprint;
      return self.putAllBlueprints(projectId, projectVersion, blueprints);
    });
};

module.exports = ProjectClient;
