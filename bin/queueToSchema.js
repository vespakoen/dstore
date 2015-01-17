'use strict';

var _ = require('underscore');
var Promise = require('bluebird');
var app = require('../bootstrap');

app.get('queue').then(function (queue) {
  return Promise.join(
    queue.setupConsumer(),
    queue.setupPublisher(),
    app.get('schema.facade')
  );
}).spread(function (consumer, publisher, facade) {
  consumer.consume('get-schema', getSchema);
  consumer.consume('get-all-schemas', getAllSchemas);
  consumer.consume('put-schema', putSchema);
  consumer.consume('put-all-schemas', putAllSchemas);
  consumer.consume('create-snapshot', createSnapshot);

  function putSchema(command) {
    console.log('put-schema', command.namespace, command.key);

    return facade.putSchema(command.namespace, command.key, command.schema);
  }

  function putAllSchemas(command) {
    console.log('put-all-schemas', command.namespace);

    return facade.putAllSchemas(command.namespace, command.schemas);
  }

  function getSchema(command) {
    console.log('get-schema', command.namespace, command.key);

    return facade.getSchema(command.namespace, command.key);
  }

  function getAllSchemas(command) {
    console.log('get-all-schemas', command.namespace);

    return facade.getAllSchemas(command.namespace);
  }

  function createSnapshot(command) {
    console.log('create-snapshot.schema', command);

    return facade.createSnapshot(command.namespace)
      .then(function (newVersion) {
        command.version = newVersion;
        return Promise.join(
          publisher.publish('migrate.postgresql', command),
          publisher.publish('migrate.elasticsearch', command)
        ).then(function () {
          // if (newVersion > 1) {
          //   return app.get('level.facade')
          //     .then(function (levelFacade) {
          //       return levelFacade.getStream(command.namespace, newVersion - 1);
          //     })
          //     .then(function (stream) {
          //       return new Promise(function (resolve) {
          //         var promises = [];

          //         stream.on('data', function (data) {
          //           promises.push(publisher.publish('put-item', {
          //             namespace: command.namespace,
          //             key: data.key,
          //             item: data.value
          //           }));
          //         });

          //         stream.on('end', function () {
          //           resolve(Promise.all(promises));
          //         });
          //       });
          //     });
          // }
        });
      });
  }
});