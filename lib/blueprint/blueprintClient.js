'use strict';

var BBPromise = require('bluebird');
var _ = require('underscore');

function BlueprintClient(differ) {
  this.differ = differ;
}

BlueprintClient.prototype.getLatestSnapshotVersion = function() {
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

BlueprintClient.prototype.getChangesBetween = function(fromVersion, toVersion) {
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

BlueprintClient.prototype.forEveryVersionOfBlueprint = function(blueprintId, version, cb) {
  var self = this;

  var allVersions = self.getVersionsForBlueprint(blueprintId, version);
  return BBPromise.all(_.map(allVersions, function(version) {
    return cb(version);
  }));
};

BlueprintClient.prototype.getVersionsForBlueprint = function(blueprintId, version) {
  var i;
  var self = this;
  var currentBlueprintKey = blueprintId;

  return self.getLog()
    .then(function (changes) {
      return _.reduce(changes, function (memo, change) {
        if (change.blueprint === currentBlueprintKey && change.type === 'blueprint.create') {
        }
      }, []);
    });
};


module.exports = BlueprintClient;
