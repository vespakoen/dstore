'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');

function ProjectFacade(service, tagger, blueprintFacade, publisher) {
  this.service = service;
  this.tagger = tagger;
  this.blueprintFacade = blueprintFacade;
  this.publisher = publisher;
}

////////////////////////////////////////////////////////////////////
///////////////////////// STATIC PROPERTIES ////////////////////////
////////////////////////////////////////////////////////////////////

ProjectFacade.attachKey = 'project.facade';

ProjectFacade.attach = function(app) {
  return BBPromise.join(
    app.get('project.service'),
    app.get('project.tagger'),
    app.get('project.blueprint.facade'),
    app.get('queue')
      .then(function (queue) {
        return queue.setupPublisher();
      })
  ).spread(function(service, tagger, blueprintFacade, publisher) {
    return new ProjectFacade(service, tagger, blueprintFacade, publisher);
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
        project_version: projectVersion
      };
    });
};

ProjectFacade.prototype.getAllProjectVersions = function() {
  var self = this;
  return this.forEveryProject(function (projectId) {
    return self.getProjectVersion(projectId);
  });    
};

ProjectFacade.prototype.getAllProjects = function() {
  var self = this;
  return this.forEveryProject(function (projectId) {
    return self.getProject(projectId);
  });
};

ProjectFacade.prototype.putProject = function(projectId, blueprints) {
  var self = this;
  return this.blueprintFacade.putAllBlueprints(projectId, blueprints)
    .then(function (putAllBlueprintsResult) {
      return self.tagProject(projectId);
    });
};

ProjectFacade.prototype.putAllProjects = function(projects) {
  var self = this;
  var chain = BBPromise.resolve();
  var results = {};
  _.each(projects, function (blueprints, projectId) {
    chain = chain.then(function() {
      return self.putProject(projectId, blueprints);
    })
    .then(function (result) {
      results[projectId] = result;
    });
  });

  chain = chain.then(function () {
    return results;
  });

  return chain;
};

ProjectFacade.prototype.delProject = function(projectId) {
  var self = this;
  
  return this.publisher.publish('drop', {
    project_id: projectId
  })
  .then(function () {
    return self.service.delProject(projectId);
  });
};

ProjectFacade.prototype.delAllProjects = function () {
  var self = this;
  return this.forEveryProject(function (projectId) {
    return self.delProject(projectId);
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
  return this.forEveryProject(function (projectId) {
    return self.tagger.tagProject(projectId);
  });
};

ProjectFacade.prototype.forEveryProject = function (cb) {
  var self = this;
  return this.service.getProjectIds()
    .then(function (projectIds) {
      var chain = BBPromise.resolve();
      var results = {};
      _.each(projectIds, function (projectId) {
        chain = chain.then(function () {
          return cb(projectId);
        })
        .then(function (result) {
          results[projectId] = result;
        });
      });

      chain = chain.then(function () {
        return results;
      });

      return chain;
    });
};

module.exports = ProjectFacade;
