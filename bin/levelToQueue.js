'use strict';

var Promise = require('bluebird');
var app = require('../bootstrap');

var namespace = 'test';

Promise.all([
  app.get('queue').then(function (queue) {
    return queue.setupPublisher();
  }),
  app.get('level.adapter').then(function (adapter) {
    return adapter.getClient(namespace, 1)
      .then(function (client) {
        return client.sublevel('item-by-type');
      });
  }),
  app.get('schema')
]).spread(function (publisher, client, schema) {
  var schemaKeys = Object.keys(schema);
  schemaKeys.forEach(function (schemaKey) {
    client.sublevel(schemaKey)
      .createReadStream()
      .on('data', function (data) {
        var item = JSON.parse(data.value);

        console.log('queuing ' + namespace + ':' + schemaKey + ':' + item.id);
        publisher.publish('put-item', {
          namespace: namespace,
          key: schemaKey,
          item: item
        });
      });
  });
});
