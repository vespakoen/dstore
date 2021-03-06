'use strict';

var test = require('trap').test;
var BBPromise = require('bluebird');

var app = require('../main')({
  stores: ['mock'],
  queue: {
    client: 'mock'
  },
  project: {
    client: 'mock'
  }
});

test('when testing the project client', function (t) {
  return app.get('project.client')
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
