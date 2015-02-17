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
    console.log('put-item.level', command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id', command.id || 'no id', command.item ? '' : 'no item');
    return facade.putItem(command.project_id, command.blueprint_id, command.id, command.item);
  }

  function delItem(command) {
    console.log('del-item.level', command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id', command.id || 'no id');
    return facade.delItem(command.project_id, command.blueprint_id, command.id);
  }
});

process.on('SIGTERM', function () {
  queue.close(function () {
    console.log('Queue to level stopping...');
    process.exit(0);
  });
});
