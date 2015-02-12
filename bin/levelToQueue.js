'use strict';

var BBPromise = require('bluebird');
var app = require('../main');

var namespace = 'test';

BBPromise.all([
  app.get('queue').then(function (queue) {
    return queue.setupPublisher();
  }),
  app.get('level.adapter').then(function (adapter) {
    return adapter.getClient(namespace, 1)
      .then(function (client) {
        return client.sublevel('item-by-type');
      });
  }),
  app.get('blueprint')
]).spread(function (publisher, client, blueprint) {
  var blueprintKeys = Object.keys(blueprint);
  blueprintKeys.forEach(function (blueprintKey) {
    client.sublevel(blueprintKey)
      .createReadStream()
      .on('data', function (data) {
        var item = JSON.parse(data.value);

        console.log('queuing ' + namespace + ':' + blueprintKey + ':' + item.id);
        publisher.publish('put-item', {
          namespace: namespace,
          key: blueprintKey,
          item: item
        });
      });
  });
});
