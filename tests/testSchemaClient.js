'use strict';

var test = require('trap').test;
var BBPromise = require('bluebird');
var rmRF = BBPromise.promisify(require('rimraf'));
var app = require('../main');
var memo = {};

test('when testing the schema client', function (t) {
  return rmRF(app.config.schema.path + '/clienttest')
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

        return memo.client.putSchema('sometype', 1, schema)
          .then(function () {
            return memo.client.getSchema('sometype', 1);
          })
          .then(function (contents) {
            ts.deepEqual(contents, schema, 'the contents should match');
          });
      });

      t.test('when putting a version', function (tv) {
        var versions = {
          "sometype": 1
        };

        return memo.client.putSchemaVersions('current', versions)
          .then(function () {
            return memo.client.getSchemaVersions('current');
          })
          .then(function (contents) {
            tv.deepEqual(contents, versions, 'the contents should match');
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
