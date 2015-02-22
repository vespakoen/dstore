'use strict';

var BBPromise = require('bluebird');
var argv = require('minimist')(process.argv.slice(2));
var app = require('../main');

var queue;

if ( ! argv.store) {
  console.error('Usage: node store.js --store=nameofthestore');
  console.error('PM2 Usage: pm2 start store.js -- --store=nameofthestore');
  process.exit(0);
}

var store = argv['store'];

BBPromise.all([
  app.get('queue').then(function (q) {
    queue = q;
    return q.setupConsumer();
  }),
  app.get('storage.' + store + '.facade')
]).spread(function (consumer, facade) {
  consumer.consume('put-item.' + store, putItem);
  consumer.consume('del-item.' + store, delItem);
  consumer.consume('migrate.' + store, migrate);
  consumer.consume('drop.' + store, drop);

  console.log('Queue to ' + store + ' started');

  function putItem(command) {
    console.log('put-item.' + store, command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id', command.id || 'no id', command.item ? '' : 'no item');
    return facade.putItem(command.project_id, command.blueprint_id, command.id, command.item);
  }

  function delItem(command) {
    console.log('del-item.' + store, command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id', command.id || 'no id');
    return facade.delItem(command.project_id, command.blueprint_id, command.id);
  }

  function migrate(command) {
    console.log('migrate.' + store, command.project_id || 'no project_id', command.project_version || 'no snapshot version', command.blueprints ? '' : 'no blueprints');
    return facade.migrate(command.project_id, command.project_version, command.blueprints);
  }

  function drop(command) {
    console.log('drop.' + store, command.project_id || 'no project_id');
    return facade.drop(command.project_id);
  }
});

process.on('SIGTERM', function () {
  if ( ! queue) return;
  queue.close(function () {
    console.log('Queue to ' + store + ' stopping...');
    process.exit(0);
  });
});
