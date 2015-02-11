'use strict';

var BBPromise = require('bluebird');
var app = require('../main');

var queue;

BBPromise.all([
  app.get('queue').then(function (q) {
    queue = q;
    return q.setupConsumer();
  }),
  app.get('level.facade')
]).spread(function (consumer, facade) {
  consumer.consume('put-item.level', putItem, true);
  consumer.consume('del-item.level', delItem, true);
  console.log('Queue to level started');

  function putItem(command) {
    console.log('put-item.level', command.namespace || 'no namespace', command.schema_key || 'no schema_key', command.id || 'no id', command.item ? '' : 'no item');
    return facade.putItem(command.namespace, command.schema_key, command.id, command.item);
  }

  function delItem(command) {
    console.log('del-item.level', command.namespace || 'no namespace', command.schema_key || 'no schema_key', command.id || 'no id');
    return facade.delItem(command.namespace, command.schema_key, command.id);
  }
});

process.on('SIGTERM', function () {
  queue.close(function () {
    console.log('Queue to level stopping...');
    process.exit(0);
  });
});
