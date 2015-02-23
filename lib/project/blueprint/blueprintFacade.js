'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');

function BlueprintFacade(service, differ) {
  this.service = service;
  this.differ = differ;
}

////////////////////////////////////////////////////////////////////
///////////////////////// STATIC PROPERTIES ////////////////////////
////////////////////////////////////////////////////////////////////

BlueprintFacade.attachKey = 'project.blueprint.facade';

BlueprintFacade.attach = function(app) {
  return BBPromise.join(
    app.get('project.blueprint.service'),
    app.get('project.blueprint.differ')
  ).spread(function(service, differ) {
    return new BlueprintFacade(service, differ);
  });
};

////////////////////////////////////////////////////////////////////
///////////////////////// INSTANCE METHODS /////////////////////////
////////////////////////////////////////////////////////////////////

BlueprintFacade.prototype.getLog = function(projectId) {
  return this.service.getLog(projectId);
};

BlueprintFacade.prototype.log = function(projectId, changes) {
  return this.service.log(projectId, changes);
};

BlueprintFacade.prototype.getBlueprint = function(projectId, blueprintId, projectVersion) {
  return this.service.getBlueprint(projectId, blueprintId, projectVersion);
};

BlueprintFacade.prototype.getAllBlueprints = function(projectId, projectVersion) {
  return this.service.getAllBlueprints(projectId, projectVersion || 'current');
};

BlueprintFacade.prototype.getBlueprintVersions = function(projectId, blueprintId) {
  return this.service.getBlueprintVersions(projectId, blueprintId);
};

BlueprintFacade.prototype.getAllBlueprintVersions = function(projectId) {
  var self = this;
  var chain = BBPromise.resolve();
  var results = {};

  return this.getAllBlueprints(projectId)
    .then(function (blueprints) {
      _.each(blueprints, function (blueprint, blueprintId) {
        chain = chain.then(function() {
          return self.service.getBlueprintVersions(projectId, blueprintId);
        })
        .then(function (result) {
          results[blueprintId] = result;
        });
      });

      chain = chain.then(function () {
        return results;
      });

      return chain;
    });
};

BlueprintFacade.prototype.putBlueprint = function(projectId, blueprintId, blueprint) {
  return this.service.putBlueprint(projectId, blueprintId, blueprint);
};

BlueprintFacade.prototype.putAllBlueprints = function(projectId, blueprints) {
  var self = this;
  var chain = BBPromise.resolve();
  var results = {};
  _.each(blueprints, function (blueprint, blueprintId) {
    chain = chain.then(function() {
      return self.putBlueprint(projectId, blueprintId, blueprint);
    })
    .then(function (result) {
      results[blueprintId] = result;
    });
  });

  chain = chain.then(function () {
    return results;
  });

  return chain;
};

BlueprintFacade.prototype.diffBlueprints = function(blueprintId, from, to) {
  return this.differ.diff(blueprintId, from, to);
};

module.exports = BlueprintFacade;
