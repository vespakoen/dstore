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
    app.get('schema.facade')
  );
}).spread(function (consumer, publisher, facade) {
  consumer.consume('get-snapshot-versions', getSnapshotVersions);
  consumer.consume('get-snapshot', getSnapshot);
  consumer.consume('create-snapshot', createSnapshot);
  consumer.consume('get-schema', getSchema);
  consumer.consume('put-schema', putSchema);
  console.log('Queue to schema started');

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

    return app.get('schema.adapter')
      .then(function (adapter) {
        var client = adapter.getClient(command.namespace);
        return BBPromise.join(
          client.getSnapshot('current'),
          client.getLatestSnapshotVersion()
        );
      })
      .spread(function (schemas, snapshotVersion) {
        command.schemas = schemas;
        command.snapshot_version = snapshotVersion + 1;
        
        return BBPromise.join(
          publisher.publish('migrate.postgresql', command),
          publisher.publish('migrate.elasticsearch', command)
        );
      })
      .then(function () {
        return facade.createSnapshot(command.namespace);
      });
  }

  function putSchema(command) {
    console.log('put-schema', command.namespace || 'no namespace', command.schema_key || 'no schema_key');

    return facade.putSchema(command.namespace, command.schema_key, command.schema);
  }

  function getSchema(command) {
    console.log('get-schema', command.namespace || 'no namespace', command.schema_key || 'no schema_key', command.snapshot_version || 'no snapshot_version');

    return facade.getSchema(command.namespace, command.schema_key, command.snapshot_version);
  }
});

process.on('SIGTERM', function () {
  queue.close(function () {
    console.log('Queue to schema stopping...');
    process.exit(0);
  });
});
