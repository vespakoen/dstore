'use strict';

var elasticsearch = require('elasticsearch');

/**
 * ElasticsearchClient
 * 
 * @class storage.elasticsearch.ElasticsearchClient
 */

/**
 * IOC attachKey.
 *
 * @type {String}
 */
exports.attachKey = 'storage.elasticsearch.client';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {BBPromise|Object} The object with resolved dependencies
 */
exports.attach = function(app) {
  var host;
  var config = app.config.elasticsearch;

  if (config.connectionParams) {
    var user = config.connectionParams.auth[0];
    var password = config.connectionParams.auth[1];
    host = user + ':' + password + '@' + config.hosts[0];
  } else {
    host = config.hosts[0];
  }

  return new elasticsearch.Client({
    host: host,
    requestTimeout: 240000
  });
};
