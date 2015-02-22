'use strict';

var BBPromise = require('bluebird');
var _ = require('underscore');
var log = require('../log');

function ProjectTagger(client, blueprintFacade, publisher) {
  this.client = client;
  this.blueprintFacade = blueprintFacade;
  this.publisher = publisher;
}

ProjectTagger.attachKey = 'project.tagger';

ProjectTagger.attach = function(app) {
  return BBPromise.join(
    app.get('project.client'),
    app.get('project.blueprint.facade'),
    app.get('queue')
      .then(function (queue) {
        return queue.setupPublisher();
      })
  )
  .spread(function (client, blueprintFacade, publisher) {
    return new ProjectTagger(client, blueprintFacade, publisher);
  });
};

ProjectTagger.prototype.tagProject = function(projectId) {
  var self = this;
  var opts  = {
    projectId: projectId
  };

  return this.client.getProjectVersion(projectId)
    .then(function (projectVersion) {
      opts.projectVersion = projectVersion;
      opts.newVersion = (projectVersion + 1);
      return self._getLatestAndCurrentBlueprints(opts);
    })
    .spread(function (latestBlueprints, currentBlueprints) {
      opts.latestBlueprints = latestBlueprints;
      opts.currentBlueprints = currentBlueprints;
      return self._hasChanges(opts);
    })
    .then(function () {
      return self.blueprintFacade.getAllBlueprints(projectId, 'current');
    })
    .then(function (blueprints) {
      var command = {
        project_id: projectId,
        project_version: opts.newVersion,
        blueprints: blueprints
      };
      
      return self.publisher.publish('migrate', command);
    })
    .then(function () {
      return self._storeCurrentBlueprintAsLatest(opts);
    })
    .then(function () {
      return self._updateProjectVersions(opts);
    })
    .then(function () {
      return self._logNewSnapshotVersion(opts);
    })
    .then(function () {
      return opts.newVersion;
    });
};

ProjectTagger.prototype._getLatestAndCurrentBlueprints = function(opts) {
 
  return BBPromise.join(
    opts.projectVersion === 0 ? {} : this.blueprintFacade.getAllBlueprints(opts.projectId, opts.projectVersion),
    this.blueprintFacade.getAllBlueprints(opts.projectId, 'current')
  );
};

ProjectTagger.prototype._hasChanges = function(opts) {
  if (_.isEqual(opts.currentBlueprints, opts.latestBlueprints)) {
    throw new Error('No changes present to create a tag for.');
  }
};

ProjectTagger.prototype._storeCurrentBlueprintAsLatest = function(opts) {
  return this.client.putAllBlueprints(opts.projectId, opts.newVersion, opts.currentBlueprints);
};

ProjectTagger.prototype._updateProjectVersions = function(opts) {
  return this.client.putProjectVersion(opts.projectId, opts.newVersion);
};

ProjectTagger.prototype._logNewSnapshotVersion = function(opts) {
  return this.blueprintFacade.log(opts.projectId, [{
    type: 'project.tag',
    value: opts.newVersion
  }]);
};

module.exports = ProjectTagger;
