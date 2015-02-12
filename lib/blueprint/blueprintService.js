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

BlueprintService.prototype.getLog = function(namespace) {
  var client = this.adapter.getClient(namespace);
  return client.getLog();
};

BlueprintService.prototype.log = function(namespace, changes) {
  var client = this.adapter.getClient(namespace);
  return client.log(changes);
};

BlueprintService.prototype.getBlueprint = function(namespace, blueprintKey, snapshotVersion) {
  var client = this.adapter.getClient(namespace);

  return client.getBlueprint(snapshotVersion || 'current', blueprintKey);
};

BlueprintService.prototype.putBlueprint = function(namespace, blueprintKey, blueprint) {
  var self = this;
  var opts = {
    namespace: namespace,
    blueprintKey: blueprintKey,
    blueprint: blueprint
  };

  return this._validatePutBlueprint(namespace, blueprintKey, blueprint)
    .then(function () {
      var client = self.adapter.getClient(namespace);
      opts.client = client;
      return client.getBlueprint('current', blueprintKey)
        .catch(function (err) {
          // not found, return null
          return null;
        });
    })
    .then(function (from) {
      return self.differ.diff(blueprintKey, from, blueprint);
    })
    .then(function (changes) {
      opts.changes = changes;
      return self._logChanges(opts);
    })
    .then(function() {
      return self._storeBlueprint(opts);
    })
    .then(function() {
      return opts.client.getBlueprint('current', blueprintKey);
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

BlueprintService.prototype.getSnapshot = function(namespace, snapshotVersion) {
  var client = this.adapter.getClient(namespace);
  return client.getSnapshot(snapshotVersion)
    .then(function (snapshot) {
      return snapshot || {}
    });
};

BlueprintService.prototype.putSnapshot = function(namespace, snapshotVersion, snapshot) {
  var client = this.adapter.getClient(namespace);
  return client.putSnapshot(snapshotVersion, snapshot);
};

BlueprintService.prototype.getLatestSnapshotVersion = function(namespace) {
  var client = this.adapter.getClient(namespace);
  return client.getLatestSnapshotVersion();
};

BlueprintService.prototype._validatePutBlueprint = function(namespace, blueprintKey, blueprint) {
  var self = this;

  return new BBPromise(function (resolve, reject) {
    if (!namespace) {
      return reject(new Error('The \'namespace\' argument is required!'));
    }
    if (!blueprintKey) {
      return reject(new Error('The \'blueprintKey\' argument is required!'));
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
    return opts.client.putBlueprint('current', opts.blueprintKey, self.differ.getRenamedBlueprint(opts.blueprint))
      .then(function () {
        var rename = _.findWhere(opts.changes, {type: 'blueprint.rename'});
        if (rename) {
          return opts.client.putBlueprint('current', rename.value, self.differ.getRenamedBlueprint(opts.blueprint));
        }
      });
  }
};

module.exports = BlueprintService;
