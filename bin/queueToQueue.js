'use strict';

var BBPromise = require('bluebird');
var app = require('../main');

var queue;

app.get('queue').then(function (q) {
  queue = q;
  return BBPromise.join(
    q.setupPublisher(),
    q.setupConsumer()
  );
})
.spread(function (publisher, consumer) {
  consumer.consume('queue', function (data) {
    return publisher.publish(data.key, data.command);
  }, true);

  consumer.consume('put-item', function (command) {
    console.log('put-item', command.project_id || 'no project_id', command.blueprint_id || 'no key', command.id || 'no id', command.item ? '' : 'no item');
    return BBPromise.join(
      publisher.publish('put-item.level', command),
      publisher.publish('put-item.postgresql', command),
      publisher.publish('put-item.elasticsearch', command)
    ).then(function () {
      return {
        success: true
      }
    });
  });

  consumer.consume('del-item', function (command) {
    console.log('del-item', command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id', command.id || 'no id');
    return BBPromise.join(
      publisher.publish('del-item.level', command),
      publisher.publish('del-item.postgresql', command),
      publisher.publish('del-item.elasticsearch', command)
    ).then(function () {
      return {
        success: true
      }
    });
  });
  console.log('Queue to queue started');
});

process.on('SIGTERM', function () {
  queue.close(function () {
    console.log('Queue to queue stopping...');
    process.exit(0);
  });
});
