'use strict';

var BBPromise = require('bluebird');

module.exports = function (app, store) {
  return BBPromise.join(
    app.get('queue')
      .then(function (queue) {
        return queue.setupConsumer();
      }),
    app.get('storage.' + store + '.facade')
  )
  .spread(function (consumer, facade) {
    function wrap(handler) {
      return function (command) {
        return handler(command)
          .catch(function (err) {
            console.error('Error in store ' + store, err);
            throw err;
          });
      }
    }

    consumer.consume('get-item.' + store, wrap(getItem));
    consumer.consume('put-item.' + store, wrap(putItem));
    consumer.consume('put-item-for-single-version.' + store, wrap(putItemForSingleVersion));
    consumer.consume('del-item.' + store, wrap(delItem));
    consumer.consume('migrate.' + store, wrap(migrate));
    consumer.consume('drop.' + store, wrap(drop));

    console.log('Queue to ' + store + ' started');

    function getItem(command) {
      console.log('get-item.' + store, command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id', command.project_version || 'no project_version', command.id || 'no id');
      return facade.getItem(command.project_id, command.blueprint_id, command.project_version, command.id);
    }

    function putItem(command) {
      console.log('put-item.' + store, command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id', command.id || 'no id', command.item ? '' : 'no item');
      return facade.putItem(command.project_id, command.blueprint_id, command.id, command.item);
    }

    function putItemForSingleVersion(command) {
      console.log('put-item-for-single-version.' + store, command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id', command.id || 'no id', command.item ? '' : 'no item');
      return facade.putItemForSingleVersion(command.project_id, command.blueprint_id, command.id, command.item);
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
};
