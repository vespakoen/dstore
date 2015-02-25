'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');

function BlueprintService(client, differ, validator) {
  this.client = client;
  this.differ = differ;
  this.validator = validator;
}

BlueprintService.attachKey = 'project.blueprint.service';

BlueprintService.attach = function(app) {
  return BBPromise.join(
    app.get('project.client'),
    app.get('project.blueprint.differ'),
    app.get('validator')
  )
  .spread(function (client, differ, validator) {
    return new BlueprintService(client, differ, validator);
  });
};

BlueprintService.prototype.getLog = function(projectId) {
  return this.client.getLog(projectId);
};

BlueprintService.prototype.log = function(projectId, changes) {
  return this.client.log(projectId, changes);
};

BlueprintService.prototype.getBlueprint = function(projectId, blueprintId, projectVersion) {
  return this.client.getBlueprint(projectId, blueprintId, projectVersion || 'current');
};

BlueprintService.prototype.putBlueprint = function(projectId, blueprintId, blueprint) {
  var self = this;
  var opts = {
    projectId: projectId,
    blueprintId: blueprintId,
    blueprint: blueprint
  };

  return this._validatePutBlueprint(projectId, blueprintId, blueprint)
    .then(function () {
      return self.client.getBlueprint(projectId, blueprintId, 'current')
        .catch(function (err) {
          // not found, return null
          return null;
        });
    })
    .then(function (from) {
      return self.differ.diff(blueprintId, from, blueprint);
    })
    .then(function (changes) {
      opts.changes = changes;
      return self._logChanges(opts);
    })
    .then(function() {
      return self._storeBlueprint(opts);
    })
    .then(function () {
      return self._storeProjectVersionIfNotPresent(opts);
    })
    .then(function() {
      return self.client.getBlueprint(projectId, blueprintId, 'current');
    });
};

BlueprintService.prototype.getBlueprintVersions = function(projectId, blueprintId) {
  var projectVersion = null;
  var found = false;

  return this.getLog(projectId)
    .then(function (changes) {
      return _.reduce(changes, function (memo, change) {
        if (change.blueprint === blueprintId && change.type === 'blueprint.create') {
          found = true;
        }

        if (change.blueprint === blueprintId && change.type === 'blueprint.remove') {
          found = false;
        }
        
        if (change.type === 'project.tag') {
          projectVersion = change.value;
          if (found) {
            memo.push(projectVersion);
          }
        }

        return memo;
      }, []);
    });
};

BlueprintService.prototype.forEveryBlueprintVersion = function(projectId, blueprintId, cb) {
  var self = this;

  return self.getBlueprintVersions(projectId, blueprintId)
    .then(function (allVersions) {
      return BBPromise.all(_.map(allVersions, function(version) {
        return cb(version);
      }));
    })
};

BlueprintService.prototype.getAllBlueprints = function(projectId, projectVersion) {
  return this.client.getAllBlueprints(projectId, projectVersion)
    .then(function (allBlueprints) {
      return allBlueprints || {};
    });
};

BlueprintService.prototype.getChangesBetween = function(projectId, fromVersion, toVersion) {
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
      if (change.type === 'project.tag') {
        lastVersion = change.value;
      }
      return lastVersion >= fromVersion && lastVersion <= toVersion || lastVersion >= toVersion && lastVersion <= fromVersion;
    });

    if (fromVersion > toVersion) {
      return self.differ.invertChanges(filteredChanges);
    }
    return filteredChanges;
  }

  return this.getLog(projectId)
    .then(filterChanges);
};

BlueprintService.prototype._validatePutBlueprint = function(projectId, blueprintId, blueprint) {
  var self = this;

  return new BBPromise(function (resolve, reject) {
    if (!projectId) {
      return reject(new Error('The \'projectId\' argument is required!'));
    }
    if (!blueprintId) {
      return reject(new Error('The \'blueprintId\' argument is required!'));
    }
    if (!blueprint) {
      return reject(new Error('The \'blueprint\' argument is required!'));
    }

    var result = self.validator.validate(blueprint, 'blueprint');
    if ( ! result.valid) {
      return reject(result.err);
    }

    resolve();
  });
};

BlueprintService.prototype._logChanges = function(opts) {
  if (opts.changes) {
    return this.client.log(opts.projectId, opts.changes);
  }
};

BlueprintService.prototype._storeBlueprint = function(opts) {
  var self = this;

  if (opts.changes.length > 0) {
    return this.client.putBlueprint(opts.projectId, opts.blueprintId, 'current', self.differ.getRenamedBlueprint(opts.blueprint))
  }
};

BlueprintService.prototype._storeProjectVersionIfNotPresent = function(opts) {
  var self = this;
  return this.client.getProjectVersion(opts.projectId)
    .then(function (projectVersion) {
      if (projectVersion === 0) {
        return self.client.putProjectVersion(opts.projectId, 'current');
      }
    });
};

module.exports = BlueprintService;
