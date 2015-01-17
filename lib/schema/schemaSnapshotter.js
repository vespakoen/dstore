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
      return self._getSchemaVersions(opts);
    })
    .spread(function (currentSchemaVersions, latestSchemaVersions) {
      opts.currentSchemaVersions = currentSchemaVersions;
      return self._schemaVersionChangesExist(opts);
    })
    .then(function() {
      return self._putCurrentSchemaVersionsAsNewVersion(opts);
    })
    .then(function () {
      return self._logNewSnapshotVersion(opts);
    })
    .then(function () {
      return self._getAllSchemas(opts);
    })
    .then(function (schemas) {
      opts.schemas = schemas;
      return self._storeAllSchemasAsSnapshot(opts);
    })
    .then(function() {
      var newVersion = opts.newVersion;
      // opts = null;
      return newVersion;
    });
};

SchemaSnapshotter.prototype._getSchemaVersions = function(opts) {
  return BBPromise.join(
    opts.client.getSchemaVersions('current'),
    opts.client.getSchemaVersions(opts.snapshotVersion)
  );
};

SchemaSnapshotter.prototype._schemaVersionChangesExist = function(opts) {
  if (_.isEqual(opts.currentSchemaVersions, opts.latestSchemaVersions)) {
    throw new Error('No changes present to create a snapshot for.');
  }
};

SchemaSnapshotter.prototype._putCurrentSchemaVersionsAsNewVersion = function(opts) {
  return opts.client.putSchemaVersions(opts.newVersion, opts.currentSchemaVersions);
};

SchemaSnapshotter.prototype._logNewSnapshotVersion = function(opts) {
  return opts.client.log([{
    type: 'snapshot.create',
    value: opts.newVersion
  }]);
};

SchemaSnapshotter.prototype._getAllSchemas = function(opts) {
  var self = this;
  return BBPromise.all(_.map(opts.currentSchemaVersions, function(schemaVersion, schemaKey) {
    return BBPromise.join(
      schemaKey,
      opts.client.getSchema(schemaKey, schemaVersion)
        .then(function (schema) {
          return self._renameSchema(schema);
        })
    );
  }));
};

SchemaSnapshotter.prototype._storeAllSchemasAsSnapshot = function(opts) {
  var snapshot = _.object(_.filter(opts.schemas, function(pair) {
    return pair[1] !== null;
  }));
  return opts.client.putSnapshot(opts.newVersion, snapshot);
};

SchemaSnapshotter.prototype._renameSchema = function(schema) {
  if (schema.key) {
    return null;
  }
  return this.differ.getRenamedSchema(schema);
};

module.exports = SchemaSnapshotter;
