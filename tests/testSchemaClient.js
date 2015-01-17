'use strict';

process.env.ENV = 'testing';
var test = require("tap").test;
var Promise = require('bluebird');
var rmRF = Promise.promisify(require('rimraf'));
var app = require('../bootstrap');
var memo = {};

rmRF(app.config.schema.path + '/namespace')
  .then(function () {
    return app.get('schema.adapter');
  })
  .then(function (adapter) {
    memo.client = adapter.getClient('namespace');

    test('when putting a schema', function (t) {
      var schema = {
        "columns": {
          "description_nl": {
            "type": "text"
          }
        }
      };

      memo.client.putSchema('news', 1, schema)
        .then(function () {
          return memo.client.getSchema('news', 1);
        })
        .then(function (contents) {
          t.deepEqual(contents, schema, 'the contents should match');
          t.end();
        });
    });

    test('when putting a version', function (t) {
      var versions = {
        "news": 1
      };

      memo.client.putSchemaVersions('current', versions)
        .then(function () {
          return memo.client.getSchemaVersions('current');
        })
        .then(function (contents) {
          t.deepEqual(contents, versions, 'the contents should match');
          t.end();
        });
    });

    test('after logging something twice', function(t) {
      memo.client.log([{part: 1}])
        .then(function () {
          return memo.client.log([{part: 2}]);
        })
        .then(function () {
          return memo.client.getLog();
        })
        .then(function (changes) {
          t.deepEqual(changes, [{part: 1}, {part: 2}], 'both changes should be in the log');
          t.end();
        });
    });
  });