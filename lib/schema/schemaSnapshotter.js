'use strict';

var BBPromise = require('bluebird');
var _ = require('underscore');

function SchemaSnapshotter(adapter, differ) {
  this.adapter = adapter;
  this.differ = differ;
}

SchemaSnapshotter.attachKey = 'schema.snapshotter';

SchemaSnapshotter.attach = function(app) {
  return BBPromise.join(
    app.get('schema.adapter'),
    app.get('schema.differ')
  ).spread(function (adapter, differ) {
    return new SchemaSnapshotter(adapter, differ);
  });
};

SchemaSnapshotter.prototype.createSnapshot = function(namespace) {
  var self = this;
  var client = this.adapter.getClient(namespace);
  var opts  = {
    client: client
  };

  return client.getLatestSnapshotVersion()
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
      return self._logNewSnapshotVersion(opts);
    })
    .then(function () {
      return opts.newVersion;
    });
};

SchemaSnapshotter.prototype._getSnapshots = function(opts) {
  return BBPromise.join(
    opts.client.getSnapshot(opts.snapshotVersion),
    opts.client.getSnapshot('current')
  );
};

SchemaSnapshotter.prototype._schemaVersionChangesExist = function(opts) {
  if (_.isEqual(opts.currentSnapshot, opts.latestSnapshot)) {
    throw new Error('No changes present to create a snapshot for.');
  }
};

SchemaSnapshotter.prototype._storeSnapshot = function(opts) {
  return opts.client.putSnapshot(opts.newVersion, opts.currentSnapshot);
};

SchemaSnapshotter.prototype._logNewSnapshotVersion = function(opts) {
  return opts.client.log([{
    type: 'snapshot.create',
    value: opts.newVersion
  }]);
};

module.exports = SchemaSnapshotter;
