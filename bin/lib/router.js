'use strict';

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
      function wrap(handler) {
        return function (command) {
          return handler(command)
            .catch(function (err) {
              console.error('Error in router', err);
              throw err;
            });
        }
      }

      var stores = app.config.stores;
      
      // ordered / serial queue
      consumer.consume('queue', wrap(queueToQueue), true);
      consumer.consume('put-item', wrap(putItem));
      consumer.consume('del-item', wrap(delItem));
      consumer.consume('migrate', wrap(migrate));
      consumer.consume('drop', wrap(drop));
      
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
