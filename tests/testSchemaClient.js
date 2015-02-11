'use strict';

var test = require('trap').test;
var BBPromise = require('bluebird');
var rmRF = BBPromise.promisify(require('rimraf'));
var app = require('../main');
var pg = require('pg');
BBPromise.promisifyAll(pg);

var memo = {};

test('when testing the schema client', function (t) {
  return rmRF(app.config.schema.path + '/clienttest')
    .then(function () {
      return app.get('postgresql.adapter');
    })
    .then(function (adapter) {
      var client = adapter.getClient('projector', 1);
      return BBPromise.join(
        client.table('log').where({ namespace: 'clienttest' }).del().then(function () {}),
        client.table('snapshots').where({ namespace: 'clienttest' }).del().then(function () {}),
        client.table('versions').where({ namespace: 'clienttest' }).del().then(function () {})
      ).catch(function () {
        // noop
      });
    })
    .then(function () {
      return app.get('schema.adapter');
    })
    .then(function (adapter) {
      memo.client = adapter.getClient('clienttest');

      t.test('when putting a schema', function (ts) {
        var schema = {
          "columns": {
            "description_nl": {
              "type": "text"
            }
          }
        };

        return memo.client.putSchema(1, 'sometype', schema)
          .then(function () {
            return memo.client.getSchema(1, 'sometype');
          })
          .then(function (contents) {
            ts.deepEqual(contents, schema, 'the contents should match');
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
