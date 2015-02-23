'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');

function ProjectService(client) {
  this.client = client;
}

ProjectService.attachKey = 'project.service';

ProjectService.attach = function(app) {
  return app.get('project.client')
    .then(function (client) {
      return new ProjectService(client);
    });
};

ProjectService.prototype.getProjectVersion = function(projectId) {
  return this.client.getProjectVersion(projectId);
};

ProjectService.prototype.getProjectIds = function() {
  return this.client.getAllProjectVersions()
    .then(function (projectVersions) {
      return Object.keys(projectVersions || {});
    });
};

ProjectService.prototype.delProject = function(projectId) {
  return this.client.delProject(projectId);
};

module.exports = ProjectService;
