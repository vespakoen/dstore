'use strict';

var test = require('trap').test;
var BBPromise = require('bluebird');
var rmRF = BBPromise.promisify(require('rimraf'));
var app = require('../main');
var memo = {};

test('when testing the blueprint service', function (t) {
  return app.get('blueprint.adapter')
    .then(function (adapter) {
      memo.adapter = adapter;
      return rmRF(app.config.blueprint.path + '/servicetest');
    })
    .then(function () {
      memo.client = memo.adapter.getClient('servicetest');
      return app.get('blueprint.facade');
    })
    .then(function (facade) {
      memo.facade = facade;
    })
    .then(function () {
      return app.get('postgresql.adapter');
    })
    .then(function (adapter) {
      var client = adapter.getClient('projector', 1);
      return BBPromise.join(
        client.table('log').where({ project_id: 'servicetest' }).del().then(function () {}),
        client.table('snapshots').where({ project_id: 'servicetest' }).del().then(function () {}),
        client.table('versions').where({ project_id: 'servicetest' }).del().then(function () {})
      ).catch(function () {
        // noop
      });
    })
    .then(function () {
      t.test("when creating a news blueprint", function (t1) {
        var blueprint = {
          "elasticsearch_type": "news",
          "table": "news",
          "columns": {
            "description_nl": {
              "type": "text"
            }
          }
        };

        return memo.facade.putBlueprint('servicetest', 'news', blueprint)
          .then(function () {
            return BBPromise.join(
              memo.client.getLog(),
              memo.client.getBlueprint('current', 'news')
            );
          })
          .spread(function (changes, storedBlueprint) {
            var change = {
              "type": "blueprint.create",
              "blueprint": "news",
              "value": {
                "elasticsearch_type": "news",
                "table": "news",
                "columns": {
                  "description_nl": {
                    "type": "text"
                  }
                }
              }
            };

            t1.deepEqual(changes[0], change, "log's first change should be " + JSON.stringify(change));
            t1.deepEqual(storedBlueprint, blueprint, "versions/news/1.json should match with " + JSON.stringify(blueprint));
          })
          .then(function () {
            return memo.facade.createSnapshot('servicetest');
          })
          .then(function() {
            return memo.client.getLog();
          })
          .then(function (changes) {
            var change = {
              "type": "snapshot.create",
              "value": 1
            };
            t1.deepEqual(changes[1], change, "log's second change should be " + JSON.stringify(change));
          });
      });

      t.test("when renaming the news blueprint to articles, and renaming the column and changing the column's type", function (t2) {
        var renamedBlueprint = {
          "key": "articles",
          "elasticsearch_type": "news",
          "table": "news",
          "columns": {
            "description_nl": {
              "key": "title_nl",
              "type": "string"
            }
          }
        };

        return memo.facade.putBlueprint('servicetest', 'news', renamedBlueprint)
          .then(function () {
            return BBPromise.join(
              memo.client.getLog(),
              memo.client.getBlueprint('current', 'news'),
              memo.client.getBlueprint('current', 'articles')
            );
          })
          .spread(function (changes, news2, articles1) {
            var change2 = {
              "type": "column.update",
              "blueprint": "news",
              "column": "description_nl",
              "key": "type",
              "oldValue": "text",
              "value": "string"
            };
            t2.deepEqual(changes[2], change2, "log's third change should be " + JSON.stringify(change2));

            var change3 = {
              "type": "column.rename",
              "blueprint": "news",
              "column": "description_nl",
              "value": "title_nl"
            };
            t2.deepEqual(changes[3], change3, "log's fourth change should be " + JSON.stringify(change3));

            var change4 = {
              "type": "blueprint.rename",
              "blueprint": "news",
              "value": "articles"
            };
            t2.deepEqual(changes[4], change4, "log's fifth change should be " + JSON.stringify(change4));

            var cleanNews1Blueprint = {
              "elasticsearch_type": "news",
              "table": "news",
              "columns": {
                "title_nl": {
                  "type": "string"
                }
              }
            };
            t2.deepEqual(cleanNews1Blueprint, news2, "versions/news/2.json should match with " + JSON.stringify(cleanNews1Blueprint));

            var cleanArticles1Blueprint = {
              "elasticsearch_type": "news",
              "table": "news",
              "columns": {
                "title_nl": {
                  "type": "string"
                }
              }
            };
            t2.deepEqual(cleanArticles1Blueprint, articles1, "versions/articles/1.json should match with " + JSON.stringify(cleanArticles1Blueprint));
          })
          .then(function () {
            return memo.facade.createSnapshot('servicetest');
          });
      });

      t.test("when adding a column to the articles blueprint", function (t3) {
        var blueprint = {
          "elasticsearch_type": "news",
          "table": "news",
          "columns": {
            "title_nl": {
              "type": "string"
            },
            "image": {
              "type": "string"
            }
          }
        };

        return memo.facade.putBlueprint('servicetest', 'articles', blueprint)
          .then(function () {
            return BBPromise.join(
              memo.client.getLog(),
              memo.client.getBlueprint('current', 'articles')
            );
          })
          .spread(function (changes, storedBlueprint) {
            var change = {
              "type": "column.create",
              "blueprint": "articles",
              "column": "image",
              "value": {
                "type": "string"
              }
            };
            t3.deepEqual(changes[6], change, "log's seventh change should be " + JSON.stringify(change));
            t3.deepEqual(storedBlueprint, blueprint, "versions/articles/2.json should match with " + JSON.stringify(blueprint));
          });
      });
    })
    .catch(function (err) {
      console.log('Errors while running test', err);
    });
});
