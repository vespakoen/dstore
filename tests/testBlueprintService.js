'use strict';

var pg = require('pg');
var test = require('trap').test;
var BBPromise = require('bluebird');
var exec = require('child-process-promise').exec;
var rmRF = BBPromise.promisify(require('rimraf'));
var app = require('../main');
BBPromise.promisifyAll(pg);

var memo = {};

function removeElasticsearchIndexes() {
  return BBPromise.join(
    exec('curl -XDELETE ' + app.config.elasticsearch.hosts[0] + '/blueprintservicetestv1'),
    exec('curl -XDELETE ' + app.config.elasticsearch.hosts[0] + '/blueprintservicetestv2')
  );
}

function getPostgresqlManageConnection() {
  var connectionString = 'postgresql://' + app.config.postgresql.username + (app.config.postgresql.password === "" ? '' : ':' + app.config.postgresql.password) + '@' + app.config.postgresql.host + '/postgres';
  return pg.connectAsync(connectionString)
    .spread(function(client, done) {
      memo.closeManageConnection = done;
      return client;
    });
}

function dropTestDatabases(memo) {
  return memo.client.queryAsync("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'blueprintservicetestv1'")
    .then(function () {
      return memo.client.queryAsync('DROP DATABASE blueprintservicetestv1');
    })
    .then(function () {
      return memo.client.queryAsync("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'blueprintservicetestv2'");
    })
    .then(function () {
      return memo.client.queryAsync('DROP DATABASE blueprintservicetestv2');
    })
    .catch(function (err) {
      // the database probably doesn't exist, so we ignore this error
      // noop
    });
}


test('when testing the blueprint service', function (t) {
  var clean = {
    file: function () {
      return rmRF(app.config.project.file.path + '/blueprintservicetest');
    },
    postgresql: function () {
      return app.get('storage.postgresql.adapter')
        .then(function (adapter) {
          var client = adapter.getClient('projector', 1);
          return BBPromise.join(
            client.table('log').where({ project_id: 'blueprintservicetest' }).del().then(function () {}),
            client.table('snapshots').where({ project_id: 'blueprintservicetest' }).del().then(function () {}),
            client.table('versions').where({ project_id: 'blueprintservicetest' }).del().then(function () {})
          ).catch(function () {
            // noop
          });
        })
    }
  };

  var clientId = app.config.project.client;
  return clean[clientId]()
    .then(function () {
      return removeElasticsearchIndexes();
    })
    .then(function () {
      return getPostgresqlManageConnection();
    })
    .then(function (client) {
      memo.client = client;
      return dropTestDatabases(memo);
    })
    .then(function () {
      return BBPromise.join(
        app.get('project.blueprint.service'),
        app.get('project.tagger')
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
            t1.deepEqual(storedBlueprint, blueprint, "versions/news/1.json should match with " + JSON.stringify(blueprint));
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
    });
});
