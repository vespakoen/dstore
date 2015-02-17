'use strict';

var test = require('trap').test;
var BBPromise = require('bluebird');
var rmRF = BBPromise.promisify(require('rimraf'));
var app = require('../main');
var pg = require('pg');
BBPromise.promisifyAll(pg);

var memo = {};

test('when testing the blueprint client', function (t) {
  return rmRF(app.config.blueprint.path + '/clienttest')
    .then(function () {
      return app.get('postgresql.adapter');
    })
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
    .then(function () {
      return app.get('blueprint.adapter');
    })
    .then(function (adapter) {
      memo.client = adapter.getClient('clienttest');

      t.test('when putting a blueprint', function (ts) {
        var blueprint = {
          "columns": {
            "description_nl": {
              "type": "text"
            }
          }
        };

        return memo.client.putBlueprint(1, 'sometype', blueprint)
          .then(function () {
            return memo.client.getBlueprint(1, 'sometype');
          })
          .then(function (contents) {
            ts.deepEqual(contents, blueprint, 'the contents should match');
          });
      });
      
      t.test('after logging something twice', function(tl) {
        return memo.client.log([{part: 1}])
          .then(function () {
            return memo.client.log([{part: 2}]);
          })
          .then(function () {
            return memo.client.getLog();
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
