'use strict';

var BBPromise = require('bluebird')
  , pg = require ('pg')
  , app = require('../main')
  , _ = require('underscore')
  , request = require('request');
var moment = require('moment');

var cfg = app.config.postgresql;
var connectionString = 'postgres://trapps:trapps@localhost:5432/trapps';

function onConnection(err, client) {
  if (err) {
    console.log(err);
  }

  app.get('queue')
    .then(function (queue) {
      return queue.setupPublisher();
    })
    .then(function (publisher) {
      request.get('http://localhost:9200/trappscms/content-type/_search?size=1000')
        .on('data', function (buf) {
          var response = JSON.parse(buf.toString());
          _.each(response.hits.hits, function (hit) {
            var contentType = hit._source;
            if (_.contains(['modulegroups', 'modules', 'contenttypes', 'kitchensink', 'intl'], contentType.table)) {
              return;
            }

            var selects = ['*'];
            _.each(contentType.fields, function (field, key) {
              if (field.type === 'linestring' || field.type === 'point') {
                selects.push('ST_AsGeoJson(' + key + ') as ' + key);
              }
            });

            selects = selects.join(',');
            client.query("SELECT " + selects + " FROM " + contentType.table, function (err, result) {
              console.log(contentType.table, err);
              if ( ! err) {
                _.each(result.rows, function(item) {
                  _.each(contentType.fields, function (field, key) {
                    if (field.type === 'linestring' || field.type === 'point') {
                      item[key] = JSON.parse(item[key]);
                    }
                  });
                  
                  item.project_version = 1;
                  item.date_created = moment(item.datecreated).format('YYYY-MM-DD HH:mm:ss');
                  delete item.datecreated;
                  item.date_changed = moment(item.datechanged).format('YYYY-MM-DD HH:mm:ss');
                  delete item.datechanged;

                  publisher.publish('put-item', {
                    project_id: 'trappscms',
                    blueprint_id: contentType.elasticsearch_type,
                    id: item.id,
                    item: item
                  }).catch(function (err) {
                    console.error(err, err.errors);
                  });
                });
              }
            });
          });
        });
    });
}

pg.connect(connectionString, onConnection);
