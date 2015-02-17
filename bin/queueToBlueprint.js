'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var app = require('../main');

var queue;

app.get('queue').then(function (q) {
  queue = q;
  return BBPromise.join(
    q.setupConsumer(),
    q.setupPublisher(),
    app.get('blueprint.facade')
  );
}).spread(function (consumer, publisher, facade) {
  consumer.consume('get-all-snapshot-versions', getAllSnapshotVersions);
  consumer.consume('get-snapshot-version', getSnapshotVersion);
  // consumer.consume('get-snapshot', getSnapshot);
  consumer.consume('create-snapshot', createSnapshot);
  consumer.consume('get-blueprint', getBlueprint);
  consumer.consume('get-all-blueprints', getAllBlueprints);
  consumer.consume('get-blueprint-versions', getBlueprintVersions);
  consumer.consume('put-blueprint', putBlueprint);

  console.log('Queue to blueprint started');

  function getAllSnapshotVersions() {
    console.log('get-snapshot-versions');

    return facade.getAllSnapshotVersions();
  }

  function getSnapshotVersion(command) {
    console.log('get-snapshot-version', command.project_id || 'no project_id');

    return facade.getSnapshotVersion(command.project_id);
  }

  // function getSnapshot(command) {
  //   console.log('get-snapshot', command.project_id || 'no project_id', command.snapshot_version || 'no snapshot_version');

  //   return facade.getSnapshot(command.project_id, command.snapshot_version);
  // }

  function createSnapshot(command) {
    console.log('create-snapshot', command.project_id || 'no project_id');

    return app.get('blueprint.adapter')
      .then(function (adapter) {
        var client = adapter.getClient(command.project_id);
        return BBPromise.join(
          client.getSnapshot('current'),
          client.getLatestSnapshotVersion()
        );
      })
      .spread(function (blueprints, snapshotVersion) {
        command.blueprints = blueprints;
        command.snapshot_version = snapshotVersion + 1;
        
        return BBPromise.join(
          publisher.publish('migrate.postgresql', command),
          publisher.publish('migrate.elasticsearch', command)
        );
      })
      .then(function () {
        return facade.createSnapshot(command.project_id);
      })
      .then(function (snapshotVersion) {
        return {
          snapshot_version: snapshotVersion
        };
      });
  }

  function putBlueprint(command) {
    console.log('put-blueprint', command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id');

    return facade.putBlueprint(command.project_id, command.blueprint_id, command.blueprint);
  }

  function getBlueprint(command) {
    console.log('get-blueprint', command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id', command.snapshot_version || 'no snapshot_version');

    return facade.getBlueprint(command.project_id, command.blueprint_id, command.snapshot_version);
  }

  function getAllBlueprints(command) {
    console.log('get-all-blueprint', command.project_id || 'no project_id', command.snapshot_version || 'no snapshot_version');

    return facade.getAllBlueprints(command.project_id, command.snapshot_version);
  }

  function getBlueprintVersions(command) {
    console.log('get-blueprint', command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id');

    return facade.getBlueprintVersions(command.project_id, command.blueprint_id);
  }
});

process.on('SIGTERM', function () {
  queue.close(function () {
    console.log('Queue to blueprint stopping...');
    process.exit(0);
  });
});
