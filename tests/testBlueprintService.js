'use strict';

var test = require('trap').test;
var BBPromise = require('bluebird');
var app = require('../main')(require('../config'));

test('when testing the blueprint service', function (t) {
  return app.get('project.facade')
    .then(function (projectFacade) {
      return BBPromise.join(
        app.get('project.blueprint.service'),
        app.get('project.tagger'),
        app.project.del('blueprintservicetest')
      );
    })
    .spread(function (service, tagger) {
      t.test("when creating a news blueprint", function (t1) {
        var blueprint = {
          "elasticsearch": {
            "type": "news"
          },
          "postgresql": {
            "table": "news"
          },
          "columns": {
            "description_nl": {
              "type": "text"
            }
          }
        };

        return service.putBlueprint('blueprintservicetest', 'news', blueprint)
          .then(function () {
            return BBPromise.join(
              service.getLog('blueprintservicetest'),
              service.getBlueprint('blueprintservicetest', 'news', 'current')
            );
          })
          .spread(function (changes, storedBlueprint) {
            var change = {
              "type": "blueprint.create",
              "blueprint": "news",
              "value": {
                "elasticsearch": {
                  "type": "news"
                },
                "postgresql": {
                  "table": "news"
                },
                "columns": {
                  "description_nl": {
                    "type": "text"
                  }
                }
              }
            };

            t1.deepEqual(changes[0], change, "log's first change should be " + JSON.stringify(change));
            t1.deepEqual(storedBlueprint, blueprint, "blueprint should match with " + JSON.stringify(blueprint));
          })
          .then(function () {
            return tagger.tagProject('blueprintservicetest');
          })
          .then(function() {
            return service.getLog('blueprintservicetest');
          })
          .then(function (changes) {
            var change = {
              "type": "project.tag",
              "value": 1
            };
            t1.deepEqual(changes[1], change, "log's second change should be " + JSON.stringify(change));
          });
      });
    })
    .catch(function (err) {
      console.log('Errors while running test', err);
      throw err;
    });
});
