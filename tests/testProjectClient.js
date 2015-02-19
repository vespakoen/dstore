'use strict';

var test = require('trap').test;
var BBPromise = require('bluebird');
var rmRF = BBPromise.promisify(require('rimraf'));
var app = require('../main');
var pg = require('pg');
BBPromise.promisifyAll(pg);

var memo = {};

test('when testing the project client', function (t) {
  var clean = {
    file: function () {
      return rmRF(app.config.project.file.path + '/clienttest');
    },
    postgresql: function () {
      return app.get('storage.postgresql.adapter')
        .then(function (adapter) {
          var client = adapter.getClient('projector', 1);
          return BBPromise.join(
            client.table('log').where({ project_id: 'clienttest' }).del().then(function () {}),
            client.table('snapshots').where({ project_id: 'clienttest' }).del().then(function () {}),
            client.table('versions').where({ project_id: 'clienttest' }).del().then(function () {})
          ).catch(function () {
            // noop
          });
        })
    }
  };

  var clientId = app.config.project.client;
  return clean[clientId]()
    .then(function () {
      return app.get('project.client');
    })
    .then(function (client) {
      t.test('when putting a blueprint', function (ts) {
        var blueprint = {
          "columns": {
            "description_nl": {
              "type": "text"
            }
          }
        };

        return client.putBlueprint('clienttest', 1, 'sometype', blueprint)
          .then(function () {
            return client.getBlueprint('clienttest', 1, 'sometype');
          })
          .then(function (contents) {
            ts.deepEqual(contents, blueprint, 'the contents should match');
          });
      });
      
      t.test('after logging something twice', function(tl) {
        return client.log('clienttest', [{part: 1}])
          .then(function () {
            return client.log('clienttest', [{part: 2}]);
          })
          .then(function () {
            return client.getLog('clienttest');
          })
          .then(function (changes) {
            tl.deepEqual(changes, [{part: 1}, {part: 2}], 'both changes should be in the log');
          });
      });
    })
    .catch(function (err) {
      console.log('Errors while running test', err);
    });
});
