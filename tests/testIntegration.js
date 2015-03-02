'use strict';

var pg = require('pg');
var knex = require('knex');
var _ = require('underscore');
var test = require('trap').test;
var BBPromise = require('bluebird');
var exec = require('child-process-promise').exec;
var rmRF = BBPromise.promisify(require('rimraf'));
var app = require('../main')(require('../config'));
BBPromise.promisifyAll(pg);

var opts = {};

function putFirstBlueprint() {
  return app.blueprint.put('integrationtest', 'kitchensink', {
    postgresql: {
      table: 'kitchensinks'
    },
    elasticsearch: {
      type: 'kitchensink'
    },
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
  });
}

function tagProject() {
  return app.project.tag('integrationtest');
}

function putFirstItem() {
  return app.storage.put('integrationtest', 'kitchensink', 'e5c20ace-7aa4-4077-983b-717c2ec5427d', {
    id: 'e5c20ace-7aa4-4077-983b-717c2ec5427d',
    project_version: 1,
    type_integer: 15,
    type_uuid: 'e5c20ace-7aa4-4077-983b-717c2ec5427d',
    type_string: 'string',
    type_text: 'text',
    type_datetime: '2012-11-10 09:08:07',
    type_date: '2012-11-10',
    type_float: 11.11111,
    type_point: {"type": "Point", "coordinates": [5.9127083, 50.78757]},
    type_linestring: {"type": "LineString", "coordinates": [[5.9127083, 50.78757], [5.9127083, 50.78754]]},
    type_polygon: {"type":"Polygon","coordinates": [[[100.0,0.0],[101.0,0.0],[101.0,1.0],[100.0,1.0],[100.0,0.0]]]},
    type_boolean: true,
    type_json: {"some": {"random": "json"}}
  });
}

function putSecondBlueprint(opts) {
  return app.blueprint.put('integrationtest', 'kitchensink', {
    postgresql: {
      table: 'kitchensinks'
    },
    elasticsearch: {
      type: 'kitchensink'
    },
    columns: {
      type_integer: {
        column_id: 'integer_type',
        type: 'integer'
      },
      type_uuid: {
        column_id: 'uuid_type',
        type: 'uuid'
      },
      type_string: {
        column_id: 'string_type',
        type: 'string'
      },
      type_text: {
        column_id: 'text_type',
        type: 'text'
      },
      type_datetime: {
        column_id: 'datetime_type',
        type: 'datetime'
      },
      type_date: {
        column_id: 'date_type',
        type: 'date'
      },
      type_float: {
        column_id: 'float_type',
        type: 'float'
      },
      type_point: {
        column_id: 'point_type',
        type: 'point'
      },
      type_linestring: {
        column_id: 'linestring_type',
        type: 'linestring'
      },
      type_polygon: {
        column_id: 'polygon_type',
        type: 'polygon'
      },
      type_boolean: {
        column_id: 'boolean_type',
        type: 'boolean'
      },
      type_json: {
        column_id: 'json_type',
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
  });
}

function putSecondItem() {
  return app.storage.put('integrationtest', 'kitchensink', 'a4f20ace-7aa4-4077-983b-717c2ec5427d', {
    id: 'a4f20ace-7aa4-4077-983b-717c2ec5427d',
    project_version: 2,
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
    type_linestring_array: {"type": "MultiLineString", "coordinates":[[[100.0,0.0],[101.0,1.0]],[[102.0,2.0],[103.0,3.0]]]},
    type_polygon_array: {"type": "MultiPolygon", "coordinates":[[[[102.0,2.0],[103.0,2.0],[103.0,3.0],[102.0,3.0],[102.0,2.0]]],[[[100.0,0.0],[101.0,0.0],[101.0,1.0],[100.0,1.0],[100.0,0.0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]]},
    type_boolean_array: [true,false],
    type_json_array: [{"some": "data"},{"more": "data"}],
    links: ['e5c20ace-7aa4-4077-983b-717c2ec5427d']
  });
}

function delSecondItem(opts) {
  return app.storage.del('integrationtest', 'kitchensink', 'a4f20ace-7aa4-4077-983b-717c2ec5427d');
}

function testElasticsearchResult(result, t) {
  t.test('when validating the elasticsearch output', function (et) {
    et.ok(!!result.hits, 'es result has hits');
    if ( ! result) return;
    var doc = result.hits.hits[0]._source;
    et.deepEqual(doc, {
      "id": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
      "project_version": 2,
      "links": [],
      "type_integer_array": null,
      "type_uuid_array": null,
      "type_string_array": null,
      "type_text_array": null,
      "type_datetime_array": null,
      "type_date_array": null,
      "type_float_array": null,
      "type_point_array": null,
      "type_linestring_array": null,
      "type_polygon_array": null,
      "type_boolean_array": null,
      "type_json_array": null,
      "integer_type": 15,
      "uuid_type": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
      "string_type": "string",
      "text_type": "text",
      "datetime_type": "2012-11-10 09:08:07",
      "date_type": "2012-11-10",
      "float_type": 11.11111,
      "point_type": [
        5.9127083,
        50.78757
      ],
      "linestring_type": {
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
      "polygon_type": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              100,
              0
            ],
            [
              101,
              0
            ],
            [
              101,
              1
            ],
            [
              100,
              1
            ],
            [
              100,
              0
            ]
          ]
        ]
      },
      "boolean_type": true,
      "json_type": {
        "some": {
          "random": "json"
        }
      }
    }, 'documents should match');
  });
}

function testLevelResult(result, t) {
  t.test('when validating the leveldb output', function (lt) {
    lt.deepEqual(result, {
      "id": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
      "project_version": 2,
      "links": [],
      "type_integer_array": null,
      "type_uuid_array": null,
      "type_string_array": null,
      "type_text_array": null,
      "type_datetime_array": null,
      "type_date_array": null,
      "type_float_array": null,
      "type_point_array": null,
      "type_linestring_array": null,
      "type_polygon_array": null,
      "type_boolean_array": null,
      "type_json_array": null,
      "integer_type": 15,
      "uuid_type": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
      "string_type": "string",
      "text_type": "text",
      "datetime_type": "2012-11-10 09:08:07",
      "date_type": "2012-11-10",
      "float_type": 11.11111,
      "point_type": {
        "type": "Point",
        "coordinates": [
          5.9127083,
          50.78757
        ]
      },
      "linestring_type": {
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
      "polygon_type": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              100,
              0
            ],
            [
              101,
              0
            ],
            [
              101,
              1
            ],
            [
              100,
              1
            ],
            [
              100,
              0
            ]
          ]
        ]
      },
      "boolean_type": true,
      "json_type": {
        "some": {
          "random": "json"
        }
      }
    }, 'documents should match');
  });
}

function testPostgresqlResult(result, t) {
  t.test('when validating the postgresql output', function (pt) {
    pt.deepEqual(result, {
      "id": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
      "project_version": 2,
      "type_integer_array": null,
      "type_uuid_array": null,
      "type_string_array": null,
      "type_text_array": null,
      "type_datetime_array": null,
      "type_date_array": null,
      "type_float_array": null,
      "type_point_array": null,
      "type_linestring_array": null,
      "type_polygon_array": null,
      "type_boolean_array": null,
      "type_json_array": null,
      "integer_type": 15,
      "uuid_type": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
      "string_type": "string",
      "text_type": "text",
      "datetime_type": "2012-11-10T08:08:07.000Z",
      "date_type": "2012-11-09T23:00:00.000Z",
      "float_type": 11.1111,
      "point_type": "0101000020E6100000AA262D019DA61740C6A70018CF644940",
      "linestring_type": "0102000020E610000002000000AA262D019DA61740C6A70018CF644940AA262D019DA617405B25581CCE644940",
      "polygon_type": "0103000020E6100000010000000500000000000000000059400000000000000000000000000040594000000000000000000000000000405940000000000000F03F0000000000005940000000000000F03F00000000000059400000000000000000",
      "boolean_type": true,
      "json_type": {
        "some": {
          "random": "json"
        }
      },
      "links": []
    }, 'documents should match');
  });
}

test('when testing integration', function (t) {
  return app.get('queue')
    .then(function (queue) {
      opts.queue = queue;
    })
    .then(function () {
      return opts.queue.setupPublisher();
    })
    .then(function (publisher) {
      opts.publisher = publisher;
    })
    .then(function (projectFacade) {
      return app.project.del('integrationtest');
    })
    .then(function () {
      return putFirstBlueprint(opts);
    })
    .then(function () {
      return tagProject(opts);
    })
    .then(function () {
      return putFirstItem(opts);
    })
    .then(function () {
      return putSecondBlueprint(opts);
    })
    .then(function () {
      return tagProject(opts);
    })
    .then(function () {
      return putSecondItem(opts);
    })
    .then(function () {
      return delSecondItem(opts);
    })
    .then(function () {
      return new BBPromise(function (resolve) {
        setTimeout(resolve, 2000);
      });
    })
    .then(function () {
      return app.storage.get('integrationtest', 'kitchensink', 2, 'e5c20ace-7aa4-4077-983b-717c2ec5427d');
    })
    .then(function (results) {
      return BBPromise.join(
        testElasticsearchResult(results.elasticsearch, t),
        testLevelResult(results.level, t),
        testPostgresqlResult(results.postgresql, t)
      );
    })
    .catch(function (err) {
      t.ok(false, "Test failed with error " + err.message);
      throw err;
    });
});
