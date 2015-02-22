'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');

function ProjectFacade(service, tagger, blueprintFacade) {
  this.service = service;
  this.tagger = tagger;
  this.blueprintFacade = blueprintFacade;
}

////////////////////////////////////////////////////////////////////
///////////////////////// STATIC PROPERTIES ////////////////////////
////////////////////////////////////////////////////////////////////

ProjectFacade.attachKey = 'project.facade';

ProjectFacade.attach = function(app) {
  return BBPromise.join(
    app.get('project.service'),
    app.get('project.tagger'),
    app.get('project.blueprint.facade')
  ).spread(function(service, tagger, blueprintFacade) {
    return new ProjectFacade(service, tagger, blueprintFacade);
  });
};

////////////////////////////////////////////////////////////////////
///////////////////////// INSTANCE METHODS /////////////////////////
////////////////////////////////////////////////////////////////////

ProjectFacade.prototype.getProject = function(projectId) {
  var self = this;
  return this.service.getProjectVersion(projectId)
    .then(function (projectVersion) {
      return self.blueprintFacade.getAllBlueprints(projectId, projectVersion);
    });
};

ProjectFacade.prototype.getProjectVersion = function(projectId) {
  return this.service.getProjectVersion(projectId)
    .then(function (projectVersion) {
      return {
        project_version: projectVersion === 0 ? 'current' : projectVersion
      };
    })
};

ProjectFacade.prototype.putProject = function(projectId, blueprints) {
  var self = this;
  return this.blueprintFacade.putAllBlueprints(projectId, blueprints)
    .then(function () {
      return self.tagProject(projectId);
    });
};

ProjectFacade.prototype.putAllProjects = function(projects) {
  var self = this;
  var chain = BBPromise.resolve();
  var results = {};
  _.each(projects, function (blueprints, projectId) {
    chain.then(function() {
      return self.putProject(projectId, blueprints);
    })
    .then(function (result) {
      results[projectId] = result;
    });
  });

  chain.then(function () {
    return results;
  });

  return chain;
};

ProjectFacade.prototype.getAllProjects = function() {
  return this.service.getProjectIds
    .then(function (projectIds) {
      var chain = BBPromise.resolve();
      var results = {};
      _.each(function (projectId) {
        chain.then(function () {
          return self.getProject(projectId);
        })
        .then(function (result) {
          results[projectId] = result;
        });
      })

      chain.then(function () {
        return results;
      });

      return chain;
    });
};

ProjectFacade.prototype.tagProject = function(projectId) {
  return this.tagger.tagProject(projectId)
    .then(function (projectVersion) {
      return {
        project_version: projectVersion
      };
    });
};

ProjectFacade.prototype.tagAllProjects = function() {
  var self = this;
  return this.service.getProjectIds
    .then(function (projectIds) {
      var chain = BBPromise.resolve();
      var results = {};
      _.each(function (projectId) {
        chain.then(function () {
          return self.tagger.tagAllProjects(projectId);
        })
        .then(function (result) {
          results[projectId] = result;
        });
      })

      chain.then(function () {
        return results;
      });

      return chain;
    });
};

module.exports = ProjectFacade;