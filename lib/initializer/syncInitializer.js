'use strict';

var BBPromise = require('bluebird');

module.exports = function (app) {
  return app.get('queue')
    .then(function (queue) {
      return queue.setupConsumer();
    })
    .then(function (consumer) {
      function wrap(handler) {
        return function (command) {
          return handler(command)
            .catch(function (err) {
              console.error('Error in sync', err);
              throw err;
            });
        }
      }

      consumer.consume('sync', wrap(sync));
      
      console.log('Queue to sync started...');

      function sync(command) {
        console.log('sync', command.project_id || 'no project_id', command.project_version || 'no snapshot version', command.blueprints ? '' : 'no blueprints');
        
        return app.get('poormanssync')
          .then(function (poorMansSync) {
            return poorMansSync.sync(command.project_id, command.project_version, command.blueprints);
          });
      }
    });
};
