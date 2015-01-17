'use strict';

process.env.ENV = 'testing';
var pg = require('pg');
var Promise = require('bluebird');
var rmRF = Promise.promisify(require('rimraf'));
var exec = require('child-process-promise').exec;
var app = require('../bootstrap');
Promise.promisifyAll(pg);

var memo = {};

app.get('queue')
  .then(function (queue) {
    memo.queue = queue;
    return rmRF(__dirname + '/../storage/schema/test');
  })
  .then(function () {
    return exec('curl -XDELETE http://localhost:9200/test');
  })
  .then(function () {
    var connectionString = 'postgresql://postgres@localhost/postgres';
    return pg.connectAsync(connectionString)
      .spread(function(client, done) {
        return Promise.join(
          client.queryAsync('DROP DATABASE testv1'),
          client.queryAsync('DROP DATABASE testv2')
        )
        .catch(function () {
          console.log('drop database', arguments);
          // noop
        });
      });
  })
  .then(function () {
    console.log('cleared elasticsearch', arguments);
    return memo.queue.setupPublisher();
  })
  .then(function (publisher) {
    return publisher.publish('put-schema', {
      namespace: 'test',
      key: 'kitchensink',
      schema: {
        table: 'kitchensinks',
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
    })
    .then(function () {
      return publisher.publish('create-snapshot', {
        namespace: 'test',
        key: 'kitchensink'
      });
    })
    .then(function () {
      return publisher.publish('put-item', {
        namespace: 'test',
        key: 'kitchensink',
        item: {
          id: 'e5c20ace-7aa4-4077-983b-717c2ec5427d',
          version: 1,
          type_integer: 15,
          type_uuid: 'e5c20ace-7aa4-4077-983b-717c2ec5427d',
          type_string: 'string',
          type_text: 'text',
          type_datetime:'12-12-2012 00:11:33',
          type_date: '12-12-2012',
          type_float: 11.11111,
          type_point: '{"type": "Point", "coordinates": [5.9127083, 50.78757]}',
          type_linestring: '{"type": "LineString", "coordinates": [[5.9127083, 50.78757], [5.9127083, 50.78754]]}',
          type_rectangle: '{"type": "Polygon", "coordinates": [[[5.9127083, 50.78757], [5.4127083, 50.88757], [5.9327083, 50.78757], [5.9127083, 50.78753]]]}',
          type_boolean: true
        }
      });
    }, function (err) {
      console.error(err);
    })
    .then(function () {
      console.log('putting schema');
      return publisher.publish('put-schema', {
        namespace: 'test',
        key: 'kitchensink',
        schema: {
          table: 'kitchensinks',
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
    })
    .then(function () {
      return publisher.publish('create-snapshot', {
        namespace: 'test',
        key: 'kitchensink'
      });
    })
    .then(function () {
      return publisher.publish('put-item', {
        namespace: 'test',
        key: 'kitchensink',
        item: {
          id: 'a4f20ace-7aa4-4077-983b-717c2ec5427d',
          version: 1,
          type_integer: 35235,
          type_uuid: 'e5c20ace-7aa4-4077-983b-717c2ec5427d',
          type_string: 'stringetje',
          type_text: 'textje',
          type_datetime:'11-05-2013 00:11:33',
          type_date: '12-12-2022',
          type_float: 22.222222222222222,
          type_point: '{"type": "Point", "coordinates": [5.9127083, 50.78757]}',
          type_linestring: '{"type": "LineString", "coordinates": [[5.9127083, 50.78757], [5.9127083, 50.78754]]}',
          type_rectangle: '{"type": "Polygon", "coordinates": [[[5.9127083, 50.78757], [5.4127083, 50.88757], [5.9327083, 50.78757], [5.9127083, 50.78753]]]}',
          type_boolean: true,
          links: ['e5c20ace-7aa4-4077-983b-717c2ec5427d']
        }
      });
    });
  });
