'use strict';

var BBPromise = require('bluebird');
var _ = require('underscore');

function SchemaClient(differ) {
  this.differ = differ;
}

SchemaClient.prototype.getCurrentVersionOfSchema = function(schemaKey) {
  return this.getSchemaVersions('current').then(function(versions) {
    return versions[schemaKey] || 0;
  });
};

SchemaClient.prototype.bumpCurrentVersionOfSchema = function(schemaKey) {
  var self = this;
  return self.getSchemaVersions('current').then(function(schemaVersions) {
    schemaVersions = schemaVersions || {};
    var currentVersion = schemaVersions[schemaKey] || 0;
    var newVersion = currentVersion + 1;
    schemaVersions[schemaKey] = newVersion;
    return self.putSchemaVersions('current', schemaVersions).then(function() {
      return newVersion;
    });
  });
};

SchemaClient.prototype.getLatestSnapshotVersion = function() {
  var self = this;

  function findSnapshotVersion(changes) {
    changes = changes || [];
    var reversed = changes.reverse();
    var snapshot = _.findWhere(reversed, {type: 'snapshot.create'});
    if (!snapshot) {
      return 0;
    }
    return snapshot.value;
  }

  return self.getLog()
    .then(findSnapshotVersion);
};

SchemaClient.prototype.getChangesBetween = function(fromVersion, toVersion) {
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

SchemaClient.prototype.forEveryVersionOfSchema = function(schemaKey, version, cb) {
  var self = this;

  var allVersions = self.getVersionsForSchema(schemaKey, version);
  return BBPromise.all(_.map(allVersions, function(version) {
    return cb(version);
  }));
};

SchemaClient.prototype.getVersionsForSchema = function(schemaKey, version) {
  var i;
  var self = this;
  var currentSchemaKey = schemaKey;

  return self.getLog()
    .then(function (changes) {
      return _.reduce(changes, function (memo, change) {
        if (change.schema === currentSchemaKey && change.type === 'schema.create') {
        }
      }, []);
    });
};


module.exports = SchemaClient;
