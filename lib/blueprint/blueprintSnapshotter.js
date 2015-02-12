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

BlueprintSnapshotter.prototype.createSnapshot = function(namespace) {
  var self = this;
  var opts  = {
    namespace: namespace
  };

  return this.service.getLatestSnapshotVersion(namespace)
    .then(function (snapshotVersion) {
      opts.snapshotVersion = snapshotVersion;
      opts.newVersion = (snapshotVersion + 1);
      return self._getSnapshots(opts);
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

BlueprintSnapshotter.prototype._getSnapshots = function(opts) {
  return BBPromise.join(
    this.service.getSnapshot(opts.namespace, opts.snapshotVersion),
    this.service.getSnapshot(opts.namespace, 'current')
  );
};

BlueprintSnapshotter.prototype._blueprintVersionChangesExist = function(opts) {
  if (_.isEqual(opts.currentSnapshot, opts.latestSnapshot)) {
    throw new Error('No changes present to create a snapshot for.');
  }
};

BlueprintSnapshotter.prototype._storeSnapshot = function(opts) {
  return this.service.putSnapshot(opts.namespace, opts.newVersion, opts.currentSnapshot);
};

BlueprintSnapshotter.prototype._updateSnapshotVersions = function(opts) {
  var self = this;

  return this.service.getSnapshotVersions()
    .then(function (snapshotVersions) {
      snapshotVersions[opts.namespace] = opts.newVersion;
      return self.service.putSnapshotVersions(snapshotVersions);
    });
};

BlueprintSnapshotter.prototype._logNewSnapshotVersion = function(opts) {
  return this.service.log(opts.namespace, [{
    type: 'snapshot.create',
    value: opts.newVersion
  }]);
};

module.exports = BlueprintSnapshotter;
