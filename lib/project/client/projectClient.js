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

ProjectClient.prototype.getChangesBetween = function(fromVersion, toVersion) {
  var self = this;

  if (toVersion === undefined) {
    toVersion = Number.POSITIVE_INFINITY;
  }

  function filterChanges(changes) {
    if (fromVersion === toVersion) {
      return [];
    }

    var lastVersion = 0;
    var filteredChanges = _.filter(changes, function(change) {
      if (change.type === 'snapshot.create') {
        lastVersion = change.value;
      }
      return lastVersion >= fromVersion && lastVersion <= toVersion || lastVersion >= toVersion && lastVersion <= fromVersion;
    });

    if (fromVersion > toVersion) {
      return self.differ.invertChanges(filteredChanges);
    }
    return filteredChanges;
  }

  return this.getLog()
    .then(filterChanges);
};

ProjectClient.prototype.forEveryVersionOfBlueprint = function(blueprintId, version, cb) {
  var self = this;

  var allVersions = self.getVersionsForBlueprint(blueprintId, version);
  return BBPromise.all(_.map(allVersions, function(version) {
    return cb(version);
  }));
};

ProjectClient.prototype.getVersionsForBlueprint = function(blueprintId, version) {
  var i;
  var self = this;
  var currentBlueprintKey = blueprintId;

  return self.getLog()
    .then(function (changes) {
      return _.reduce(changes, function (memo, change) {
        if (change.blueprint === currentBlueprintKey && change.type === 'blueprint.create') {
        }
      }, []);
    });
};


module.exports = ProjectClient;
