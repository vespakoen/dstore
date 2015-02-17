'use strict';

var BBPromise = require('bluebird');
var _ = require('underscore');

function BlueprintSnapshotter(service, differ) {
  this.service = service;
  this.differ = differ;
}

BlueprintSnapshotter.attachKey = 'blueprint.snapshotter';

BlueprintSnapshotter.attach = function(app) {
  return BBPromise.join(
    app.get('blueprint.service'),
    app.get('blueprint.differ')
  ).spread(function (service, differ) {
    return new BlueprintSnapshotter(service, differ);
  });
};

BlueprintSnapshotter.prototype.createSnapshot = function(projectId) {
  var self = this;
  var opts  = {
    projectId: projectId
  };

  return this.service.getLatestSnapshotVersion(projectId)
    .then(function (snapshotVersion) {
      opts.snapshotVersion = snapshotVersion;
      opts.newVersion = (snapshotVersion + 1);
      return self._getBlueprints(opts);
    })
    .spread(function (latestSnapshot, currentSnapshot) {
      opts.latestSnapshot = latestSnapshot;
      opts.currentSnapshot = currentSnapshot;
      return self._blueprintVersionChangesExist(opts);
    })
    .then(function () {
      return self._storeSnapshot(opts);
    })
    .then(function () {
      return self._updateSnapshotVersions(opts);
    })
    .then(function () {
      return self._logNewSnapshotVersion(opts);
    })
    .then(function () {
      return opts.newVersion;
    });
};

BlueprintSnapshotter.prototype._getBlueprints = function(opts) {
  return BBPromise.join(
    this.service.getAllBlueprints(opts.projectId, opts.snapshotVersion),
    this.service.getAllBlueprints(opts.projectId, 'current')
  );
};

BlueprintSnapshotter.prototype._blueprintVersionChangesExist = function(opts) {
  if (_.isEqual(opts.currentSnapshot, opts.latestSnapshot)) {
    throw new Error('No changes present to create a snapshot for.');
  }
};

BlueprintSnapshotter.prototype._storeSnapshot = function(opts) {
  return this.service.putSnapshot(opts.projectId, opts.newVersion, opts.currentSnapshot);
};

BlueprintSnapshotter.prototype._updateSnapshotVersions = function(opts) {
  var self = this;

  return this.service.getSnapshotVersions()
    .then(function (snapshotVersions) {
      snapshotVersions[opts.projectId] = opts.newVersion;
      return self.service.putSnapshotVersions(snapshotVersions);
    });
};

BlueprintSnapshotter.prototype._logNewSnapshotVersion = function(opts) {
  return this.service.log(opts.projectId, [{
    type: 'snapshot.create',
    value: opts.newVersion
  }]);
};

module.exports = BlueprintSnapshotter;
