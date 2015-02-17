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
    console.log('put-item.postgresql', command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id', command.id || 'no id', command.item ? '' : 'no item');
    return facade.putItem(command.project_id, command.blueprint_id, command.id, command.item);
  }

  function delItem(command) {
    console.log('del-item.postgresql', command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id', command.id || 'no id');
    return facade.delItem(command.project_id, command.blueprint_id, command.id);
  }

  function migrate(command) {
    console.log('migrate.postgresql', command.project_id || 'no project_id', command.snapshot_version || 'no snapshot_version', command.blueprints ? '' : 'no blueprints');
    return facade.migrate(command.project_id, command.snapshot_version, command.blueprints);
  }
});

process.on('SIGTERM', function () {
  queue.close(function () {
    console.log('Queue to postgresql stopping...');
    process.exit(0);
  });
});
