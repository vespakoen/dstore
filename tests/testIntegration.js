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
    .catch(function (err) {
      // the database probably doesn't exist, so we ignore this error
      // noop
    });
}

function putFirstSchema(opts) {
  return opts.publisher.publish('put-schema', {
    namespace: 'integrationtest',
    schema_key: 'kitchensink',
    schema: {
      table: 'kitchensinks',
      elasticsearch_type: 'kitchensink',
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
        type_polygon: {
          type: 'polygon'
        },
        type_boolean: {
          type: 'boolean'
        },
        type_json: {
          type: 'json'
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
    schema_key: 'kitchensink',
    id: 'e5c20ace-7aa4-4077-983b-717c2ec5427d',
    item: {
      id: 'e5c20ace-7aa4-4077-983b-717c2ec5427d',
      snapshot_version: 1,
      type_integer: 15,
      type_uuid: 'e5c20ace-7aa4-4077-983b-717c2ec5427d',
      type_string: 'string',
      type_text: 'text',
      type_datetime: '2012-11-10 09:08:07',
      type_date: '2012-11-10',
      type_float: 11.11111,
      type_point: {"type": "Point", "coordinates": [5.9127083, 50.78757]},
      type_linestring: {"type": "LineString", "coordinates": [[5.9127083, 50.78757], [5.9127083, 50.78754]]},
      type_polygon: {"type": "Polygon", "coordinates": [[[5.9127083, 50.78757], [5.4127083, 50.88757], [5.9327083, 50.78757], [5.9127083, 50.78753]]]},
      type_boolean: true,
      type_json: {"some": {"random": "json"}}
    }
  });
}

function putSecondSchema(opts) {
  return opts.publisher.publish('put-schema', {
    namespace: 'integrationtest',
    schema_key: 'kitchensink',
    schema: {
      table: 'kitchensinks',
      elasticsearch_type: 'kitchensink',
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
        type_polygon: {
          key: 'polygon_type',
          type: 'polygon'
        },
        type_boolean: {
          key: 'boolean_type',
          type: 'boolean'
        },
        type_json: {
          key: 'json_type',
          type: 'json'
        },
        type_integer_array: {
          type: 'integer[]'
        },
        type_uuid_array: {
          type: 'uuid[]'
        },
        type_string_array: {
          type: 'string[]'
        },
        type_text_array: {
          type: 'text[]'
        },
        type_datetime_array: {
          type: 'datetime[]'
        },
        type_date_array: {
          type: 'date[]'
        },
        type_float_array: {
          type: 'float[]'
        },
        type_point_array: {
          type: 'point[]'
        },
        type_linestring_array: {
          type: 'linestring[]'
        },
        type_polygon_array: {
          type: 'polygon[]'
        },
        type_boolean_array: {
          type: 'boolean[]'
        },
        type_json_array: {
          type: 'json[]'
        }
      }
    }
  });
}

function putSecondItem(opts) {
  return opts.publisher.publish('put-item', {
    namespace: 'integrationtest',
    schema_key: 'kitchensink',
    id: 'a4f20ace-7aa4-4077-983b-717c2ec5427d',
    item: {
      id: 'a4f20ace-7aa4-4077-983b-717c2ec5427d',
      snapshot_version: 2,
      integer_type: 35235,
      uuid_type: 'e5c20ace-7aa4-4077-983b-717c2ec5427d',
      string_type: 'stringetje',
      text_type: 'textje',
      datetime_type: '05-06-2007 05:06:07',
      date_type: '05-06-2007',
      float_type: 22.222222222222222,
      point_type: {"type": "Point", "coordinates": [5.9127083, 50.78757]},
      linestring_type: {"type": "LineString", "coordinates": [[5.9127083, 50.78757], [5.9127083, 50.78754]]},
      polygon_type: {"type":"Polygon","coordinates":[[[100.0,0.0],[101.0,0.0],[101.0,1.0],[100.0,1.0],[100.0,0.0]]]},
      boolean_type: true,
      json_type: {"some": {"random": "json"}},
      type_integer_array: [1,2,3],
      type_uuid_array: ["0c02a6b3-babd-4399-9105-42c40189bb89", "0cf7a1f2-800b-43ee-a4a1-838a76533108"],
      type_string_array: ["testing", "it", "out"],
      type_text_array: ["testing", "it", "out"],
      type_datetime_array: ["05-06-2007 05:06:07", "06-07-2008 06:07:08"],
      type_date_array: ["05-06-2007", "06-07-2008"],
      type_float_array: [22.2222, 33.3333],
      type_point_array: {"type": "MultiPoint", "coordinates": [[5.9127083, 50.78757], [5.9127083, 50.78757]]},
      type_linestring_array: {"type":"MultiLineString","coordinates":[[[100.0,0.0],[101.0,1.0]],[[102.0,2.0],[103.0,3.0]]]},
      type_polygon_array: {"type":"MultiPolygon","coordinates":[[[[102.0,2.0],[103.0,2.0],[103.0,3.0],[102.0,3.0],[102.0,2.0]]],[[[100.0,0.0],[101.0,0.0],[101.0,1.0],[100.0,1.0],[100.0,0.0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]]},
      type_boolean_array: [true,false],
      type_json_array: [{"some": "data"},{"more": "data"}],
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
      et.ok(!!result.hits, 'es result has hits');
      if ( ! result) return;
      var doc = result.hits.hits[0]._source;
      et.deepEqual(doc, {
        "id": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
        "snapshot_version": 1,
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
        "type_polygon": {
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
        "type_json": {
          "some": {
            "random": "json"
          }
        },
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
    opts.levelClient.sublevel('item-by-id')
      .get('e5c20ace-7aa4-4077-983b-717c2ec5427d', lt.cb(function(err, result) {
        lt.deepEqual(JSON.parse(result), {
          "id": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
          "links": [],
          "type_boolean": true,
          "type_date": "2012-11-10",
          "type_datetime": "2012-11-10 09:08:07",
          "type_float": 11.11111,
          "type_integer": 15,
          "type_json": {
            "some": {
              "random": "json"
            }
          },
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
          "type_point": {
            "type": "Point",
            "coordinates": [
              5.9127083,
              50.78757
            ]
          },
          "type_polygon": {
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
          "type_string": "string",
          "type_text": "text",
          "type_uuid": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
          "snapshot_version": 1
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
        knex.raw('ST_AsGeoJSON(type_polygon) as type_polygon'),
        knex.raw('to_char(type_datetime, \'YYYY-MM-DD HH24:MI:SS\') as type_datetime'),
        knex.raw('to_char(type_date, \'YYYY-MM-DD\') as type_date'),
      ])
      .where({
        id: 'e5c20ace-7aa4-4077-983b-717c2ec5427d'
      })
      .then(function (result) {
        pt.deepEqual(result, {
          "id": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
          "snapshot_version": 1,
          "type_integer": 15,
          "type_uuid": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
          "type_string": "string",
          "type_text": "text",
          "type_datetime": "2012-11-10 09:08:07",
          "type_date": "2012-11-10",
          "type_float": 11.1111,
          "type_point": "{\"type\":\"Point\",\"coordinates\":[5.9127083,50.78757]}",
          "type_linestring": "{\"type\":\"LineString\",\"coordinates\":[[5.9127083,50.78757],[5.9127083,50.78754]]}",
          "type_polygon": "{\"type\":\"Polygon\",\"coordinates\":[[[5.9127083,50.78757],[5.4127083,50.88757],[5.9327083,50.78757],[5.9127083,50.78753]]]}",
          "type_boolean": true,
          "type_json": {
            "some": {
              "random": "json"
            }
          },
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
      return app.get('postgresql.adapter');
    })
    .then(function (adapter) {
      var client = adapter.getClient('projector', 1);
      return BBPromise.join(
        client.table('log').where({ namespace: 'testintegration' }).del().then(function () {}),
        client.table('snapshots').where({ namespace: 'testintegration' }).del().then(function () {}),
        client.table('versions').where({ namespace: 'testintegration' }).del().then(function () {})
      ).catch(function () {
        // noop
      });
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
      t.ok(false, "Test failed with error " + err.message);
    });
});
