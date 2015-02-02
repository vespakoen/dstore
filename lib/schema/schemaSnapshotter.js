'use strict';

var BBPromise = require('bluebird');
var _ = require('underscore');

function SchemaSnapshotter(service, differ) {
  this.service = service;
  this.differ = differ;
}

SchemaSnapshotter.attachKey = 'schema.snapshotter';

SchemaSnapshotter.attach = function(app) {
  return BBPromise.join(
    app.get('schema.service'),
    app.get('schema.differ')
  ).spread(function (service, differ) {
    return new SchemaSnapshotter(service, differ);
  });
};

SchemaSnapshotter.prototype.createSnapshot = function(namespace) {
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
      return self._schemaVersionChangesExist(opts);
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

SchemaSnapshotter.prototype._getSnapshots = function(opts) {
  return BBPromise.join(
    this.service.getSnapshot(opts.namespace, opts.snapshotVersion),
    this.service.getSnapshot(opts.namespace, 'current')
  );
};

SchemaSnapshotter.prototype._schemaVersionChangesExist = function(opts) {
  if (_.isEqual(opts.currentSnapshot, opts.latestSnapshot)) {
    throw new Error('No changes present to create a snapshot for.');
  }
};

SchemaSnapshotter.prototype._storeSnapshot = function(opts) {
  return this.service.putSnapshot(opts.namespace, opts.newVersion, opts.currentSnapshot);
};

SchemaSnapshotter.prototype._updateSnapshotVersions = function(opts) {
  var self = this;

  return this.service.getSnapshotVersions()
    .then(function (snapshotVersions) {
      snapshotVersions[opts.namespace] = opts.newVersion;
      return self.service.putSnapshotVersions(snapshotVersions);
    });
};

SchemaSnapshotter.prototype._logNewSnapshotVersion = function(opts) {
  return this.service.log(opts.namespace, [{
    type: 'snapshot.create',
    value: opts.newVersion
  }]);
};

module.exports = SchemaSnapshotter;
