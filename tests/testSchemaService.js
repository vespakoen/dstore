'use strict';

process.env.ENV = 'testing';
var test = require('tap').test;
var Promise = require('bluebird');
var rmRF = Promise.promisify(require('rimraf'));
var app = require('../bootstrap');
var memo = {};

app.get('schema.adapter')
  .then(function (adapter) {
    memo.adapter = adapter;
    memo.client = adapter.getClient('test');
    return app.get('schema.facade');
  })
  .then(function (facade) {
    memo.facade = facade;
    return rmRF(memo.client.path);
  })
  .then(function () {
    test("when creating a news schema", function (t) {
      var schema = {
        "es_type": "news",
        "table": "news",
        "columns": {
          "description_nl": {
            "type": "text"
          }
        }
      };

      memo.facade.putSchema('test', 'news', schema)
        .then(function () {
          return Promise.join(
            memo.client.getLog(),
            memo.client.getSchema('news', 1)
          );
        })
        .spread(function (changes, storedSchema) {
          var change = {
            "type": "schema.create",
            "schema": "news",
            "value": {
              "es_type": "news",
              "table": "news",
              "columns": {
                "description_nl": {
                  "type": "text"
                }
              }
            }
          };

          t.deepEqual(changes[0], change, "log's first change should be " + JSON.stringify(change));
          t.deepEqual(storedSchema, schema, "versions/news/1.json should match with " + JSON.stringify(schema));
        })
        .then(function () {
          return memo.facade.createSnapshot('test');
        })
        .then(function() {
          return memo.client.getLog();
        })
        .then(function (changes) {
          var change = {
            "type": "snapshot.create",
            "value": 1
          };
          t.deepEqual(changes[1], change, "log's second change should be " + JSON.stringify(change));
          t.end();
        });
    });

    test("when renaming the news schema to articles, and renaming the column and changing the column's type", function (t) {
      var renamedSchema = {
        "key": "articles",
        "es_type": "news",
        "table": "news",
        "columns": {
          "description_nl": {
            "key": "title_nl",
            "type": "string"
          }
        }
      };

      memo.facade.putSchema('test', 'news', renamedSchema)
        .then(function () {
          return Promise.join(
            memo.client.getLog(),
            memo.client.getSchema('news', 2),
            memo.client.getSchema('articles', 1)
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
          t.deepEqual(changes[2], change2, "log's third change should be " + JSON.stringify(change2));

          var change3 = {
            "type": "column.rename",
            "schema": "news",
            "column": "description_nl",
            "value": "title_nl"
          };
          t.deepEqual(changes[3], change3, "log's fourth change should be " + JSON.stringify(change3));

          var change4 = {
            "type": "schema.rename",
            "schema": "news",
            "value": "articles"
          };
          t.deepEqual(changes[4], change4, "log's fifth change should be " + JSON.stringify(change4));

          var cleanNews1Schema = {
            "es_type": "news",
            "table": "news",
            "columns": {
              "title_nl": {
                "type": "string"
              }
            }
          };
          t.deepEqual(cleanNews1Schema, news2, "versions/news/2.json should match with " + JSON.stringify(cleanNews1Schema));

          var cleanArticles1Schema = {
            "es_type": "news",
            "table": "news",
            "columns": {
              "title_nl": {
                "type": "string"
              }
            }
          };
          t.deepEqual(cleanArticles1Schema, articles1, "versions/articles/1.json should match with " + JSON.stringify(cleanArticles1Schema));
        })
        .then(function () {
          return memo.facade.createSnapshot('test');
        })
        .then(function () {
          t.end();
        });
    });

    test("when adding a column to the articles schema", function (t) {
      var schema = {
        "es_type": "news",
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

      memo.facade.putSchema('test', 'articles', schema)
        .then(function () {
          return Promise.join(
            memo.client.getLog(),
            memo.client.getSchema('articles', 2)
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
          t.deepEqual(changes[6], change, "log's seventh change should be " + JSON.stringify(change));
          t.deepEqual(storedSchema, schema, "versions/articles/2.json should match with " + JSON.stringify(schema));
        })
        .then(function () {
          return memo.facade.createSnapshot('test');
        })
        .then(function () {
          t.end();
        });
    });
  });
