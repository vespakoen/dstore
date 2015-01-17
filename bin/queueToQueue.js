'use strict';

var BBPromise = require('bluebird');;
var app = require('../main');

app.get('queue').then(function (queue) {
  return BBPromise.join(
    queue.setupPublisher(),
    queue.setupConsumer()
  );
})
.spread(function (publisher, consumer) {
  consumer.consume('put-item', function (command) {
    console.log('put-item', command.namespace || 'no namespace', command.key || 'no key', command.item ? command.item.id || 'no item id' : '');
    return BBPromise.join(
      publisher.publish('put-item.level', command),
      publisher.publish('put-item.postgresql', command),
      publisher.publish('put-item.elasticsearch', command)
    );
  });

  consumer.consume('del-item', function (command) {
    console.log('del-item', command.namespace || 'no namespace', command.key || 'no key', command.version || 'no version', command.id || 'no id');
    return BBPromise.join(
      publisher.publish('del-item.level', command),
      publisher.publish('del-item.postgresql', command),
      publisher.publish('del-item.elasticsearch', command)
    );
  });
});
