'use strict';

var test = require('trap').test;
var BBPromise = require('bluebird');
var rmRF = BBPromise.promisify(require('rimraf'));
var app = require('../main');
var memo = {};

test('when testing the schema service', function (t) {
  return app.get('schema.adapter')
    .then(function (adapter) {
      memo.adapter = adapter;
      return rmRF(app.config.schema.path + '/servicetest');
    })
    .then(function () {
      memo.client = memo.adapter.getClient('servicetest');
      return app.get('schema.facade');
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
        client.table('log').where({ namespace: 'servicetest' }).del().then(function () {}),
        client.table('snapshots').where({ namespace: 'servicetest' }).del().then(function () {}),
        client.table('versions').where({ namespace: 'servicetest' }).del().then(function () {})
      );
    })
    .then(function () {
      t.test("when creating a news schema", function (t1) {
        var schema = {
          "elasticsearch_type": "news",
          "table": "news",
          "columns": {
            "description_nl": {
              "type": "text"
            }
          }
        };

        return memo.facade.putSchema('servicetest', 'news', schema)
          .then(function () {
            return BBPromise.join(
              memo.client.getLog(),
              memo.client.getSchema('current', 'news')
            );
          })
          .spread(function (changes, storedSchema) {
            var change = {
              "type": "schema.create",
              "schema": "news",
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
            t1.deepEqual(storedSchema, schema, "versions/news/1.json should match with " + JSON.stringify(schema));
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

      t.test("when renaming the news schema to articles, and renaming the column and changing the column's type", function (t2) {
        var renamedSchema = {
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

        return memo.facade.putSchema('servicetest', 'news', renamedSchema)
          .then(function () {
            return BBPromise.join(
              memo.client.getLog(),
              memo.client.getSchema('current', 'news'),
              memo.client.getSchema('current', 'articles')
            );
          })
          .spread(function (changes, news2, articles1) {
            var change2 = {
              "type": "column.update",
              "schema": "news",
              "column": "description_nl",
              "key": "type",
              "oldValue": "text",
              "value": "string"
            };
            t2.deepEqual(changes[2], change2, "log's third change should be " + JSON.stringify(change2));

            var change3 = {
              "type": "column.rename",
              "schema": "news",
              "column": "description_nl",
              "value": "title_nl"
            };
            t2.deepEqual(changes[3], change3, "log's fourth change should be " + JSON.stringify(change3));

            var change4 = {
              "type": "schema.rename",
              "schema": "news",
              "value": "articles"
            };
            t2.deepEqual(changes[4], change4, "log's fifth change should be " + JSON.stringify(change4));

            var cleanNews1Schema = {
              "elasticsearch_type": "news",
              "table": "news",
              "columns": {
                "title_nl": {
                  "type": "string"
                }
              }
            };
            t2.deepEqual(cleanNews1Schema, news2, "versions/news/2.json should match with " + JSON.stringify(cleanNews1Schema));

            var cleanArticles1Schema = {
              "elasticsearch_type": "news",
              "table": "news",
              "columns": {
                "title_nl": {
                  "type": "string"
                }
              }
            };
            t2.deepEqual(cleanArticles1Schema, articles1, "versions/articles/1.json should match with " + JSON.stringify(cleanArticles1Schema));
          })
          .then(function () {
            return memo.facade.createSnapshot('servicetest');
          });
      });

      t.test("when adding a column to the articles schema", function (t3) {
        var schema = {
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

        return memo.facade.putSchema('servicetest', 'articles', schema)
          .then(function () {
            return BBPromise.join(
              memo.client.getLog(),
              memo.client.getSchema('current', 'articles')
            );
          })
          .spread(function (changes, storedSchema) {
            var change = {
              "type": "column.create",
              "schema": "articles",
              "column": "image",
              "value": {
                "type": "string"
              }
            };
            t3.deepEqual(changes[6], change, "log's seventh change should be " + JSON.stringify(change));
            t3.deepEqual(storedSchema, schema, "versions/articles/2.json should match with " + JSON.stringify(schema));
          });
      });
    })
    .catch(function (err) {
      console.log('Errors while running test', err);
    });
});
