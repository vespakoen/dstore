"use strict";

var _ = require('underscore');
var BBPromise = require('bluebird');
var help = require('../helpers');

/**
 * ElasticsearchMigrator
 * 
 * @class elasticsearch.ElasticsearchMigrator
 *
 * @param {elasticsearch.ElasticsearchClient} client
 */
function ElasticsearchMigrator(client) {
  this.client = client;
}

/**
 * IOC attachKey
 *
 * @type {String}
 */
ElasticsearchMigrator.attachKey = 'elasticsearch.migrator';

/**
 * IOC attach
 *
 * @param {App} app
 *
 * @return {BBPromise|Object} The object with resolved dependencies
 */
ElasticsearchMigrator.attach = function(app) {
  return app.get('elasticsearch.client')
    .then(function(client) {
      return new ElasticsearchMigrator(client);
    });
};

/**
 * Create a new elasticsearch index and put the mapping.
 *
 * @param  {String} namespace
 * @param  {Number} snapshotVersion
 *
 * @return {BBPromise}
 */
ElasticsearchMigrator.prototype.migrate = function(namespace, snapshotVersion, schemas) {
  var self = this;
  var opts = {
    index: namespace + 'v' + snapshotVersion,
    schemas: schemas
  };

  return self._createIndex(opts)
    .then(function () {
      return self._putMapping(opts);
    });
};

/**
 * Create a new elasticsearch index.
 *
 * @protected
 * @param opts
 * @param opts.index The name of the index to create
 *
 * @return {BBPromise.<undefined>}
 */
ElasticsearchMigrator.prototype._createIndex = function(opts) {
  var self = this;

  return self.client.indices.exists({
    index: opts.index
  })
  .then(function(exists) {
    if (!exists) {
      return self.client.indices.create({
        index: opts.index
      });
    }
  });
};

/**
 * Create and put a mapping.
 *
 * @protected
 * @param opts
 * @param opts.schemas  The schemas to turn into a mapping
 * @param opts.index    The index to put the mapping to
 *
 * @return {BBPromise.<undefined>}
 */
ElasticsearchMigrator.prototype._putMapping = function (opts) {
  var self = this;

  var promises = _.map(opts.schemas, function(schema, schemaKey) {
    var mapping = {};

    mapping[schemaKey] = {
      _id: {path: 'id'},
      properties: {}
    };

    _.each(schema.columns, function(column, columnKey) {
      mapping[schemaKey].properties[columnKey] = self['_define' + help.capitalizeFirstLetter(column.type).replace('[]', '')](column);

      // if extra options are given for elasticsearch, use those instead
      if (column.elasticsearch) {
        mapping[schemaKey].properties[columnKey] = column.elasticsearch;
      }
    });

    return this.client.indices.putMapping({
      index: opts.index,
      type: schemaKey,
      body: mapping
    });
  }, this);

  return BBPromise.all(promises);
};

/**
 * Define a uuid mapping.
 *
 * @protected
 */
ElasticsearchMigrator.prototype._defineUuid = function () {
  return this._defineString();
};

/**
 * Define a text mapping.
 *
 * @protected
 */
ElasticsearchMigrator.prototype._defineText = function () {
  return this._defineString();
};

/**
 * Define a string mapping.
 *
 * @protected
 */
ElasticsearchMigrator.prototype._defineString = function () {
  return {
    type: 'string',
    index: 'not_analyzed'
  };
};

/**
 * Define a point mapping.
 *
 * @protected
 */
ElasticsearchMigrator.prototype._definePoint = function () {
  return {
    type: 'geo_point'
  };
};

/**
 * Define a linestring mapping.
 *
 * @protected
 */
ElasticsearchMigrator.prototype._defineLinestring = function () {
  return this._defineShape();
};

/**
 * Define a polygon mapping.
 *
 * @protected
 */
ElasticsearchMigrator.prototype._definePolygon = function () {
  return this._defineShape();
};

/**
 * Define a shape mapping.
 *
 * @protected
 */
ElasticsearchMigrator.prototype._defineShape = function () {
  return {
    type: 'geo_shape',
    tree: 'quadtree',
    precision: '10m'
  };
};

/**
 * Define a date mapping.
 *
 * @protected
 */
ElasticsearchMigrator.prototype._defineDate = function () {
  return {
    type: 'date',
    format: 'yyyy-MM-dd'
  };
};

/**
 * Define a datetime mapping.
 *
 * @protected
 */
ElasticsearchMigrator.prototype._defineDatetime = function () {
  return {
    type: 'date',
    format: 'yyyy-MM-dd HH:mm:ss'
  };
};

/**
 * Define a float mapping.
 *
 * @protected
 */
ElasticsearchMigrator.prototype._defineFloat = function () {
  return {
    type: 'float'
  };
};

/**
 * Define a integer mapping.
 *
 * @protected
 */
ElasticsearchMigrator.prototype._defineInteger = function () {
  return {
    type: 'integer'
  };
};

/**
 * Define a boolean mapping.
 *
 * @protected
 */
ElasticsearchMigrator.prototype._defineBoolean = function () {
  return {
    type: 'boolean'
  };
};

/**
 * Define a json mapping.
 *
 * @protected
 */
ElasticsearchMigrator.prototype._defineJson = function () {
  return {
    type: 'object',
    enabled: false
  };
};

module.exports = ElasticsearchMigrator;
