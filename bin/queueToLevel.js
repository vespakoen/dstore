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
  consumer.consume('put-item.level', putItem);
  consumer.consume('del-item.level', delItem);
  console.log('Queue to level started');

  function putItem(command) {
    console.log('put-item.level', command.namespace || 'no namespace', command.key || 'no key', command.item ? command.item.id || 'no item id' : '');
    return facade.putItem(command.namespace, command.key, command.item);
  }

  function delItem(command) {
    console.log('del-item.level', command.namespace || 'no namespace', command.key || 'no key', command.version || 'no version', command.id || 'no id');
    return facade.delItem(command.namespace, command.key, command.id);
  }
});

process.on('SIGTERM', function () {
  queue.close(function () {
    console.log('Queue to level stopping...');
    process.exit(0);
  });
});
