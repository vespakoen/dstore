var _ = require('underscore');
var BBPromise = require('bluebird');
var app = require('../../main');

module.exports = function () {
  return app.get('queue')
    .then(function (queue) {
      return BBPromise.join(
        queue.setupConsumer(),
        queue.setupPublisher()
      );
    })
    .spread(function (consumer, publisher) {
      var stores = app.config.stores;
      
      // ordered / serial queue
      consumer.consume('queue', queueToQueue, true);
      consumer.consume('put-item', putItem);
      consumer.consume('del-item', delItem);
      consumer.consume('migrate', migrate);
      consumer.consume('drop', drop);
      
      console.log('Router started...');

      function queueToQueue(data) {
        return publisher.publish(data.key, data.command);
      }

      function putItem(command) {
        console.log('put-item', command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id', command.id || 'no id', command.item ? '' : 'no item');
        
        return BBPromise.all(_.map(stores, function (store) {
          return publisher.publish('put-item.' + store, command);
        }))
        .then(function () {
          return {
            success: true
          };
        });
      }

      function delItem(command) {
        console.log('del-item', command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id', command.id || 'no id');
        
        return BBPromise.all(_.map(stores, function (store) {
          return publisher.publish('del-item.' + store, command);
        }))
        .then(function () {
          return {
            success: true
          };
        });
      }

      function migrate(command) {
        console.log('migrate', command.project_id || 'no project_id', command.project_version || 'no project_version', command.blueprints ? '' : 'no blueprints');
        
        return BBPromise.all(_.map(stores, function (store) {
          return publisher.publish('migrate.' + store, command);
        }))
        .then(function () {
          return {
            success: true
          };
        });
      }

      function drop(command) {
        console.log('drop', command.project_id || 'no project_id');
        
        return BBPromise.all(_.map(stores, function (store) {
          return publisher.publish('drop.' + store, command);
        }))
        .then(function () {
          return {
            success: true
          };
        });
      }
    });

};
