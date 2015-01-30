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
  consumer.consume('get-schema', getSchema);
  consumer.consume('put-schema', putSchema);
  consumer.consume('get-snapshot-versions', getSnapshotVersions);
  consumer.consume('get-snapshot', getSnapshot);
  consumer.consume('create-snapshot', createSnapshot);
  console.log('Queue to schema started');

  function putSchema(command) {
    console.log('put-schema', command.namespace || 'no namespace', command.schema_key || 'no schema_key');

    return facade.putSchema(command.namespace, command.schema_key, command.schema);
  }

  function getSchema(command) {
    console.log('get-schema', command.namespace || 'no namespace', command.schema_key || 'no schema_key', command.snapshot_version || 'no snapshot_version');

    return facade.getSchema(command.namespace, command.schema_key, command.snapshot_version);
  }

  function createSnapshot(command) {
    console.log('create-snapshot', command.namespace || 'no namespace');

    return facade.createSnapshot(command.namespace)
      .then(function (snapshotVersion) {
        command.snapshot_version = snapshotVersion;
        return BBPromise.join(
          publisher.publish('migrate.postgresql', command),
          publisher.publish('migrate.elasticsearch', command)
        ).then(function () {
          return snapshotVersion;
          // if (newVersion > 1) {
          //   return app.get('level.facade')
          //     .then(function (levelFacade) {
          //       return levelFacade.getStream(command.namespace, newVersion - 1);
          //     })
          //     .then(function (stream) {
          //       return new BBPromise(function (resolve) {
          //         var promises = [];

          //         stream.on('data', function (data) {
          //           // @todo transform item
          //           promises.push(publisher.publish('put-item', {
          //             namespace: command.namespace,
          //             key: data.key,
          //             item: data.value
          //           }));
          //         });

          //         stream.on('end', function () {
          //           resolve(BBPromise.all(promises));
          //         });
          //       });
          //     });
          // }
        });
      });
  }

  function getSnapshotVersions() {
    console.log('get-snapshot-versions');

    return facade.getSnapshotVersions();
  }

  function getSnapshot(command) {
    console.log('get-snapshot', command.namespace || 'no namespace', command.snapshot_version || 'no snapshot_version');

    return facade.getSnapshot(command.namespace, command.snapshot_version);
  }
});

process.on('SIGTERM', function () {
  queue.close(function () {
    console.log('Queue to schema stopping...');
    process.exit(0);
  });
});
