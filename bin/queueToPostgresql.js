'use strict';

var BBPromise = require('bluebird');
var app = require('../main');

var queue;

BBPromise.all([
  app.get('queue').then(function (q) {
    queue = q;
    return queue.setupConsumer();
  }),
  app.get('postgresql.facade')
]).spread(function (consumer, facade) {
  consumer.consume('put-item.postgresql', putItem);
  consumer.consume('del-item.postgresql', delItem);
  consumer.consume('migrate.postgresql', migrate);
  console.log('Queue to postgresql started');

  function putItem(command) {
    console.log('put-item.postgresql', command.namespace || 'no namespace', command.key || 'no key', command.item ? command.item.id || 'no item id' : '');
    return facade.putItem(command.namespace, command.key, command.item);
  }

  function delItem(command) {
    console.log('del-item.postgresql', command.namespace || 'no namespace', command.key || 'no key', command.snapshot_version || 'no snapshot version', command.id || 'no id');
    return facade.delItem(command.namespace, command.key, command.snapshot_version, command.id);
  }

  function migrate(command) {
    console.log('migrate.postgresql', command.namespace || 'no namespace', command.snapshot_version || 'no snapshot version');
    return facade.migrate(command.namespace, command.snapshot_version);
  }
});

process.on('SIGTERM', function () {
  queue.close(function () {
    console.log('Queue to postgresql stopping...');
    process.exit(0);
  });
});
