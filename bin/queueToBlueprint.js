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
  consumer.consume('get-snapshot-versions', getSnapshotVersions);
  consumer.consume('get-snapshot', getSnapshot);
  consumer.consume('create-snapshot', createSnapshot);
  consumer.consume('get-blueprint', getBlueprint);
  consumer.consume('put-blueprint', putBlueprint);
  console.log('Queue to blueprint started');

  function getSnapshotVersions() {
    console.log('get-snapshot-versions');

    return facade.getSnapshotVersions();
  }

  function getSnapshot(command) {
    console.log('get-snapshot', command.namespace || 'no namespace', command.snapshot_version || 'no snapshot_version');

    return facade.getSnapshot(command.namespace, command.snapshot_version);
  }

  function createSnapshot(command) {
    console.log('create-snapshot', command.namespace || 'no namespace');

    return app.get('blueprint.adapter')
      .then(function (adapter) {
        var client = adapter.getClient(command.namespace);
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
        return facade.createSnapshot(command.namespace);
      })
      .then(function (snapshotVersion) {
        return {
          snapshot_version: snapshotVersion
        };
      });
  }

  function putBlueprint(command) {
    console.log('put-blueprint', command.namespace || 'no namespace', command.blueprint_key || 'no blueprint_key');

    return facade.putBlueprint(command.namespace, command.blueprint_key, command.blueprint);
  }

  function getBlueprint(command) {
    console.log('get-blueprint', command.namespace || 'no namespace', command.blueprint_key || 'no blueprint_key', command.snapshot_version || 'no snapshot_version');

    return facade.getBlueprint(command.namespace, command.blueprint_key, command.snapshot_version);
  }
});

process.on('SIGTERM', function () {
  queue.close(function () {
    console.log('Queue to blueprint stopping...');
    process.exit(0);
  });
});
