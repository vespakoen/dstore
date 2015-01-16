'use strict';

var Promise = require('bluebird');
var app = require('../bootstrap');

Promise.all([
  app.get('queue').then(function (queue) {
    return queue.setupConsumer();
  }),
  app.get('postgresql.facade')
]).spread(function (consumer, facade) {
  consumer.consume('put-item.postgresql', putItem);
  consumer.consume('del-item.postgresql', delItem);
  consumer.consume('migrate.postgresql', migrate);

  function putItem(command) {
    console.log('put-item.postgresql', command.namespace || 'no namespace', command.key || 'no key', command.item ? command.item.id || 'no item id' : '');
    return facade.putItem(command.namespace, command.key, command.item);
  }

  function delItem(command) {
    console.log('del-item.postgresql', command.namespace || 'no namespace', command.key || 'no key', command.version || 'no version', command.id || 'no id');
    return facade.delItem(command.namespace, command.key, command.id);
  }

  function migrate(command) {
    console.log('migrate.postgresql', command.namespace || 'no namespace', command.version || 'no version');
    return facade.migrate(command.namespace, command.version);
  }
});
