'use strict';

var BBPromise = require('bluebird');;
var app = require('../main');

BBPromise.all([
  app.get('queue').then(function (queue) {
    return queue.setupConsumer();
  }),
  app.get('elasticsearch.facade')
]).spread(function (consumer, facade) {
  consumer.consume('put-item.elasticsearch', putItem);
  consumer.consume('del-item.elasticsearch', delItem);
  consumer.consume('migrate.elasticsearch', migrate);

  function putItem(command) {
    console.log('put-item.elasticsearch', command.namespace || 'no namespace', command.key || 'no key', command.item ? command.item.id || 'no item id' : '');
    return facade.putItem(command.namespace, command.key, command.item);
  }

  function delItem(command) {
    console.log('del-item.elasticsearch', command.namespace || 'no namespace', command.key || 'no key', command.version || 'no version', command.id || 'no id');
    return facade.delItem(command.namespace, command.key, command.id);
  }

  function migrate(command) {
    console.log('migrate.elasticsearch', command.namespace || 'no namespace', command.version || 'no version');
    return facade.migrate(command.namespace, command.version);
  }
});
