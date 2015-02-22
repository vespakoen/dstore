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
  ).spread(function (client, differ, validator) {
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
    .then(function() {
      return self.client.getBlueprint(projectId, blueprintId, 'current');
    });
};

BlueprintService.prototype.getBlueprintVersions = function (projectId, blueprintId) {
  return BBPromise.resolve({
    "soon": "This will be implemented"
  });
};

BlueprintService.prototype.getAllBlueprints = function(projectId, projectVersion) {
  return this.client.getAllBlueprints(projectId, projectVersion)
    .then(function (allBlueprints) {
      return allBlueprints || {};
    });
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
      .then(function () {
        var rename = _.findWhere(opts.changes, {type: 'blueprint.rename'});
        if (rename) {
          return self.client.putBlueprint(opts.projectId, rename.value, 'current', self.differ.getRenamedBlueprint(opts.blueprint));
        }
      });
  }
};

module.exports = BlueprintService;
