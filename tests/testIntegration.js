'use strict';

var pg = require('pg');
var knex = require('knex');
var _ = require('underscore');
var test = require('trap').test;
var BBPromise = require('bluebird');
var exec = require('child-process-promise').exec;
var rmRF = BBPromise.promisify(require('rimraf'));
var app = require('../main');
BBPromise.promisifyAll(pg);

var opts = {};

function removeSchema() {
  return rmRF(app.config.schema.path + '/integrationtest');
}

function removeElasticsearchIndexes() {
  return BBPromise.join(
    exec('curl -XDELETE ' + app.config.elasticsearch.hosts[0] + '/integrationtestv1'),
    exec('curl -XDELETE ' + app.config.elasticsearch.hosts[0] + '/integrationtestv2')
  );
}

function getPostgresqlManageConnection() {
  var connectionString = 'postgresql://' + app.config.postgresql.username + (app.config.postgresql.password === "" ? '' : ':' + app.config.postgresql.password) + '@' + app.config.postgresql.host + '/postgres';
  return pg.connectAsync(connectionString)
    .spread(function(client, done) {
      opts.closeManageConnection = done;
      return client;
    });
}

function dropTestDatabases(opts) {
  return opts.client.queryAsync("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'integrationtestv1'")
    .then(function () {
      return opts.client.queryAsync('DROP DATABASE integrationtestv1');
    })
    .then(function () {
      return opts.client.queryAsync("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'integrationtestv2'");
    })
    .then(function () {
      return opts.client.queryAsync('DROP DATABASE integrationtestv2');
    })
    .catch(function () {
      // the database probably doesn't exist, so we ignore this error
      // noop
    });
}

function putFirstSchema(opts) {
  return opts.publisher.publish('put-schema', {
    namespace: 'integrationtest',
    key: 'kitchensink',
    schema: {
      table: 'kitchensinks',
      es_type: 'kitchensink',
      columns: {
        type_integer: {
          type: 'integer'
        },
        type_uuid: {
          type: 'uuid'
        },
        type_string: {
          type: 'string'
        },
        type_text: {
          type: 'text'
        },
        type_datetime: {
          type: 'datetime'
        },
        type_date: {
          type: 'date'
        },
        type_float: {
          type: 'float'
        },
        type_point: {
          type: 'point'
        },
        type_linestring: {
          type: 'linestring'
        },
        type_rectangle: {
          type: 'rectangle'
        },
        type_boolean: {
          type: 'boolean'
        }
      }
    }
  });
}

function createSnapshot(opts) {
  return opts.publisher.publish('create-snapshot', {
    namespace: 'integrationtest'
  });
}

function putFirstItem(opts) {
  return opts.publisher.publish('put-item', {
    namespace: 'integrationtest',
    key: 'kitchensink',
    item: {
      id: 'e5c20ace-7aa4-4077-983b-717c2ec5427d',
      version: 1,
      type_integer: 15,
      type_uuid: 'e5c20ace-7aa4-4077-983b-717c2ec5427d',
      type_string: 'string',
      type_text: 'text',
      type_datetime: '2012-11-10 09:08:07',
      type_date: '2012-11-10',
      type_float: 11.11111,
      type_point: '{"type": "Point", "coordinates": [5.9127083, 50.78757]}',
      type_linestring: '{"type": "LineString", "coordinates": [[5.9127083, 50.78757], [5.9127083, 50.78754]]}',
      type_rectangle: '{"type": "Polygon", "coordinates": [[[5.9127083, 50.78757], [5.4127083, 50.88757], [5.9327083, 50.78757], [5.9127083, 50.78753]]]}',
      type_boolean: true
    }
  });
}

function putSecondSchema(opts) {
  return opts.publisher.publish('put-schema', {
    namespace: 'integrationtest',
    key: 'kitchensink',
    schema: {
      table: 'kitchensinks',
      es_type: 'kitchensink',
      columns: {
        type_integer: {
          key: 'integer_type',
          type: 'integer'
        },
        type_uuid: {
          key: 'uuid_type',
          type: 'uuid'
        },
        type_string: {
          key: 'string_type',
          type: 'string'
        },
        type_text: {
          key: 'text_type',
          type: 'text'
        },
        type_datetime: {
          key: 'datetime_type',
          type: 'datetime'
        },
        type_date: {
          key: 'date_type',
          type: 'date'
        },
        type_float: {
          key: 'float_type',
          type: 'float'
        },
        type_point: {
          key: 'point_type',
          type: 'point'
        },
        type_linestring: {
          key: 'linestring_type',
          type: 'linestring'
        },
        type_rectangle: {
          key: 'rectangle_type',
          type: 'rectangle'
        },
        type_boolean: {
          key: 'boolean_type',
          type: 'boolean'
        }
      }
    }
  });
}

function putSecondItem(opts) {
  return opts.publisher.publish('put-item', {
    namespace: 'integrationtest',
    key: 'kitchensink',
    item: {
      id: 'a4f20ace-7aa4-4077-983b-717c2ec5427d',
      version: 1,
      type_integer: 35235,
      type_uuid: 'e5c20ace-7aa4-4077-983b-717c2ec5427d',
      type_string: 'stringetje',
      type_text: 'textje',
      type_datetime: '05-06-2007 05:06:07',
      type_date: '05-06-2007',
      type_float: 22.222222222222222,
      type_point: '{"type": "Point", "coordinates": [5.9127083, 50.78757]}',
      type_linestring: '{"type": "LineString", "coordinates": [[5.9127083, 50.78757], [5.9127083, 50.78754]]}',
      type_rectangle: '{"type": "Polygon", "coordinates": [[[5.9127083, 50.78757], [5.4127083, 50.88757], [5.9327083, 50.78757], [5.9127083, 50.78753]]]}',
      type_boolean: true,
      links: ['e5c20ace-7aa4-4077-983b-717c2ec5427d']
    }
  });
}

function getElasticsearchClient(opts) {
  return app.get('elasticsearch.client');
}

function testElasticsearchResult(opts, t) {
  t.test('when validating the elasticsearch output', function (et) {
    return opts.elasticsearchClient.search({
      index: 'integrationtestv1',
      type: 'kitchensink',
      id: 'e5c20ace-7aa4-4077-983b-717c2ec5427d'
    })
    .then(function (result) {
      var doc = result.hits.hits[0]._source;
      et.deepEqual(doc, {
        "id": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
        "version": 1,
        "type_integer": 15,
        "type_uuid": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
        "type_string": "string",
        "type_text": "text",
        "type_datetime": "2012-11-10 09:08:07",
        "type_date": "2012-11-10",
        "type_float": 11.11111,
        "type_point": [
          5.9127083,
          50.78757
        ],
        "type_linestring": {
          "type": "LineString",
          "coordinates": [
            [
              5.9127083,
              50.78757
            ],
            [
              5.9127083,
              50.78754
            ]
          ]
        },
        "type_rectangle": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                5.9127083,
                50.78757
              ],
              [
                5.4127083,
                50.88757
              ],
              [
                5.9327083,
                50.78757
              ],
              [
                5.9127083,
                50.78753
              ]
            ]
          ]
        },
        "type_boolean": true,
        "links": []
      }, 'documents should match');
    });
  });
}

function getLevelClient(opts) {
  return app.get('level.adapter').then(function (levelAdapter) {
    opts.levelAdapter = levelAdapter;
    return levelAdapter.getClient('integrationtest', 1);
  });
}

function testLevelResult(opts, t) {
  t.test('when validating the leveldb output', function (lt) {
    return opts.levelClient.sublevel('item-by-id')
      .get('e5c20ace-7aa4-4077-983b-717c2ec5427d', lt.cb(function(err, result) {
        lt.deepEqual(JSON.parse(result), {
          "id": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
          "links": [],
          "type_boolean": true,
          "type_date": "2012-11-10",
          "type_datetime": "2012-11-10 09:08:07",
          "type_float": 11.11111,
          "type_integer": 15,
          "type_linestring": "{\"type\": \"LineString\", \"coordinates\": [[5.9127083, 50.78757], [5.9127083, 50.78754]]}",
          "type_point": "{\"type\": \"Point\", \"coordinates\": [5.9127083, 50.78757]}",
          "type_rectangle": "{\"type\": \"Polygon\", \"coordinates\": [[[5.9127083, 50.78757], [5.4127083, 50.88757], [5.9327083, 50.78757], [5.9127083, 50.78753]]]}",
          "type_string": "string",
          "type_text": "text",
          "type_uuid": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
          "version": 1
        }, 'documents should match');
      }));
  });
}

function getPostgresqlClient(opts) {
  return app.get('postgresql.adapter').then(function (postgresqlAdapter) {
    opts.postgresqlAdapter = postgresqlAdapter;
    return postgresqlAdapter.getClient('integrationtest', 1);
  });
}

function testPostgresqlResult(opts, t) {
  t.test('when validating the postgresql output', function (pt) {
    return opts.postgresqlClient.table('kitchensinks')
      .first([
        '*',
        knex.raw('ST_AsGeoJSON(type_point) as type_point'),
        knex.raw('ST_AsGeoJSON(type_linestring) as type_linestring'),
        knex.raw('ST_AsGeoJSON(type_rectangle) as type_rectangle'),
        knex.raw('to_char(type_datetime, \'YYYY-MM-DD HH24:MI:SS\') as type_datetime'),
        knex.raw('to_char(type_date, \'YYYY-MM-DD\') as type_date'),
      ])
      .where({
        id: 'e5c20ace-7aa4-4077-983b-717c2ec5427d'
      })
      .then(function (result) {
        pt.deepEqual(result, {
          "id": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
          "version": 1,
          "type_integer": 15,
          "type_uuid": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
          "type_string": "string",
          "type_text": "text",
          "type_datetime": "2012-11-10 09:08:07",
          "type_date": "2012-11-10",
          "type_float": 11.1111,
          "type_point": "{\"type\":\"Point\",\"coordinates\":[5.9127083,50.78757]}",
          "type_linestring": "{\"type\":\"LineString\",\"coordinates\":[[5.9127083,50.78757],[5.9127083,50.78754]]}",
          "type_rectangle": "{\"type\":\"Polygon\",\"coordinates\":[[[5.9127083,50.78757],[5.4127083,50.88757],[5.9327083,50.78757],[5.9127083,50.78753]]]}",
          "type_boolean": true,
          "links": []
        }, 'documents should match');
      });
  });
}

test('when testing integration', function (t) {
  return app.get('queue')
    .then(function (queue) {
      opts.queue = queue;
      return removeSchema();
    })
    .then(function () {
      return removeElasticsearchIndexes();
    })
    .then(function () {
      return getPostgresqlManageConnection();
    })
    .then(function (client) {
      opts.client = client;
      return dropTestDatabases(opts);
    })
    .then(function () {
      return opts.queue.setupPublisher();
    })
    .then(function (publisher) {
      opts.publisher = publisher;
      return putFirstSchema(opts);
    })
    .then(function () {
      return createSnapshot(opts);
    })
    .then(function () {
      return putFirstItem(opts);
    })
    .then(function () {
      return putSecondSchema(opts)
    })
    .then(function () {
      return createSnapshot(opts);
    })
    .then(function () {
      return putSecondItem(opts);
    })
    .then(function () {
      return BBPromise.join(
        getElasticsearchClient(opts),
        getLevelClient(opts),
        getPostgresqlClient(opts)
      );
    })
    .spread(function (elasticsearchClient, levelClient, postgresqlClient) {
      opts.elasticsearchClient = elasticsearchClient;
      opts.levelClient = levelClient;
      opts.postgresqlClient = postgresqlClient;

      return BBPromise.join(
        testElasticsearchResult(opts, t),
        testLevelResult(opts, t),
        testPostgresqlResult(opts, t)
      );
    })
    .catch(function (err) {
      console.error('errors while running test', err);
    });
});
