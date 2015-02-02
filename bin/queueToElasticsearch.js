'use strict';

var BBPromise = require('bluebird');
var app = require('../main');

var queue;

BBPromise.all([
  app.get('queue').then(function (q) {
    queue = q;
    return q.setupConsumer();
  }),
  app.get('elasticsearch.facade')
]).spread(function (consumer, facade) {
  consumer.consume('put-item.elasticsearch', putItem);
  consumer.consume('del-item.elasticsearch', delItem);
  consumer.consume('migrate.elasticsearch', migrate);

  console.log('Queue to elasticsearch started');

  function putItem(command) {
    console.log('put-item.elasticsearch', command.namespace || 'no namespace', command.schema_key || 'no schema_key', command.id || 'no id', command.item ? '' : 'no item');
    return facade.putItem(command.namespace, command.schema_key, command.id, command.item);
  }

  function delItem(command) {
    console.log('del-item.elasticsearch', command.namespace || 'no namespace', command.schema_key || 'no schema_key', command.id || 'no id');
    return facade.delItem(command.namespace, command.schema_key, command.id);
  }

  function migrate(command) {
    console.log('migrate.elasticsearch', command.namespace || 'no namespace', command.snapshot_version || 'no snapshot version', command.schemas ? '' : 'no schemas');
    return facade.migrate(command.namespace, command.snapshot_version, command.schemas);
  }
});

process.on('SIGTERM', function () {
  queue.close(function () {
    console.log('Queue to elasticsearch stopping...');
    process.exit(0);
  });
});
