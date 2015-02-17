'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');

function BlueprintService(adapter, differ, validator) {
  this.adapter = adapter;
  this.differ = differ;
  this.validator = validator;
}

BlueprintService.attachKey = 'blueprint.service';

BlueprintService.attach = function(app) {
  return BBPromise.join(
    app.get('blueprint.adapter'),
    app.get('blueprint.differ'),
    app.get('validator')
  ).spread(function (adapter, differ, validator) {
    return new BlueprintService(adapter, differ, validator);
  });
};

BlueprintService.prototype.getLog = function(projectId) {
  var client = this.adapter.getClient(projectId);
  return client.getLog();
};

BlueprintService.prototype.log = function(projectId, changes) {
  var client = this.adapter.getClient(projectId);
  return client.log(changes);
};

BlueprintService.prototype.getBlueprint = function(projectId, blueprintId, snapshotVersion) {
  var client = this.adapter.getClient(projectId);

  return client.getBlueprint(snapshotVersion || 'current', blueprintId);
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
      var client = self.adapter.getClient(projectId);
      opts.client = client;
      return client.getBlueprint('current', blueprintId)
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
      return opts.client.getBlueprint('current', blueprintId);
    });
};

BlueprintService.prototype.getBlueprintVersions = function (projectId, blueprintId) {
  return BBPromise.resolve({"soon": "This will be implemented"});
};

BlueprintService.prototype.getSnapshotVersion = function (projectId) {
  return this.getSnapshotVersions()
    .then(function (snapshotVersions) {
      if ( ! snapshotVersions[projectId]) {
        throw new Error("Snapshot version not found for project_id: '" + projectId + "'");
      }

      return {
        snapshot_version: snapshotVersions[projectId]
      };
    });
};

BlueprintService.prototype.getSnapshotVersions = function() {
  var client = this.adapter.getClient();
  return client.getSnapshotVersions()
    .then(function (snapshotVersions) {
      return snapshotVersions || {};
    });
};

BlueprintService.prototype.putSnapshotVersions = function(snapshotVersions) {
  var client = this.adapter.getClient();
  return client.putSnapshotVersions(snapshotVersions);
};

BlueprintService.prototype.getAllBlueprints = function(projectId, snapshotVersion) {
  var client = this.adapter.getClient(projectId);
  return client.getSnapshot(snapshotVersion)
    .then(function (snapshot) {
      return snapshot || {}
    });
};

BlueprintService.prototype.putSnapshot = function(projectId, snapshotVersion, snapshot) {
  var client = this.adapter.getClient(projectId);
  return client.putSnapshot(snapshotVersion, snapshot);
};

BlueprintService.prototype.getLatestSnapshotVersion = function(projectId) {
  var client = this.adapter.getClient(projectId);
  return client.getLatestSnapshotVersion();
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
    return opts.client.log(opts.changes);
  }
};

BlueprintService.prototype._storeBlueprint = function(opts) {
  var self = this;

  if (opts.changes.length > 0) {
    return opts.client.putBlueprint('current', opts.blueprintId, self.differ.getRenamedBlueprint(opts.blueprint))
      .then(function () {
        var rename = _.findWhere(opts.changes, {type: 'blueprint.rename'});
        if (rename) {
          return opts.client.putBlueprint('current', rename.value, self.differ.getRenamedBlueprint(opts.blueprint));
        }
      });
  }
};

module.exports = BlueprintService;
