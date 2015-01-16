"use strict";

var _ = require('underscore');
var Promise = require('bluebird');
var help = require('../helpers');

/**
 * @class elasticsearch.ElasticsearchMigrator
 * ElasticsearchMigrator
 *
 * @param {elasticsearch.ElasticsearchClient} client
 * @param {schema.SchemaAdapter} schemaAdapter
 */
function ElasticsearchMigrator(client, schemaAdapter) {
  this.client = client;
  this.schemaAdapter = schemaAdapter;
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
 * @return {Promise|Object} The object with resolved dependencies
 */
ElasticsearchMigrator.attach = function(app) {
  return Promise.join(
    app.get('elasticsearch.client'),
    app.get('schema.adapter')
  ).spread(function(client, schemaAdapter) {
    return new ElasticsearchMigrator(client, schemaAdapter);
  });
};

/**
 * Create a new elasticsearch index version and put the mapping.
 *
 * @param  {String} namespace
 * @param  {Number} version
 *
 * @return {Promise.<null>}
 */
ElasticsearchMigrator.prototype.migrate = function(namespace, version) {
  var self = this;
  var opts = {
    index: namespace + 'v' + version
  };

  var schemaClient = this.schemaAdapter.getClient(namespace);
  return schemaClient.getSnapshot(version)
    .then(function (schemas) {
      opts.schemas = schemas;
      return self._createIndex(opts);
    })
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
 * @return {Promise.<null>}
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
 * @return {Promise.<null>}
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
      self['_define' + help.capitalizeFirstLetter(column.type)](mapping, schemaKey, column, columnKey);
    });

    return this.client.indices.putMapping({
      index: opts.index,
      type: schemaKey,
      body: mapping
    });
  }, this);

  return Promise.all(promises);
};

/**
 * Define a uuid mapping.
 *
 * @protected
 * @param  {Object} mapping
 * @param  {String} schemaKey
 * @param  {Object} column
 * @param  {String} columnKey
 */
ElasticsearchMigrator.prototype._defineUuid = function (mapping, schemaKey, column, columnKey) {
  return this._defineString(mapping, schemaKey, column, columnKey);
};

/**
 * Define a text mapping.
 *
 * @protected
 * @param  {Object} mapping
 * @param  {String} schemaKey
 * @param  {Object} column
 * @param  {String} columnKey
 */
ElasticsearchMigrator.prototype._defineText = function (mapping, schemaKey, column, columnKey) {
  return this._defineString(mapping, schemaKey, column, columnKey);
};

/**
 * Define a string mapping.
 *
 * @protected
 * @param  {Object} mapping
 * @param  {String} schemaKey
 * @param  {Object} column
 * @param  {String} columnKey
 */
ElasticsearchMigrator.prototype._defineString = function (mapping, schemaKey, column, columnKey) {
  mapping[schemaKey].properties[columnKey] = {
    type: 'string',
    index: 'not_analyzed'
  };
};

/**
 * Define a point mapping.
 *
 * @protected
 * @param  {Object} mapping
 * @param  {String} schemaKey
 * @param  {Object} column
 * @param  {String} columnKey
 */
ElasticsearchMigrator.prototype._definePoint = function (mapping, schemaKey, column, columnKey) {
  mapping[schemaKey].properties[columnKey] = {
    type: 'geo_point'
  };
};

/**
 * Define a linestring mapping.
 *
 * @protected
 * @param  {Object} mapping
 * @param  {String} schemaKey
 * @param  {Object} column
 * @param  {String} columnKey
 */
ElasticsearchMigrator.prototype._defineLinestring = function (mapping, schemaKey, column, columnKey) {
  return this._defineShape(mapping, schemaKey, column, columnKey);
};

/**
 * Define a rectangle mapping.
 *
 * @protected
 * @param  {Object} mapping
 * @param  {String} schemaKey
 * @param  {Object} column
 * @param  {String} columnKey
 */
ElasticsearchMigrator.prototype._defineRectangle = function (mapping, schemaKey, column, columnKey) {
  return this._defineShape(mapping, schemaKey, column, columnKey);
};

/**
 * Define a polygon mapping.
 *
 * @protected
 * @param  {Object} mapping
 * @param  {String} schemaKey
 * @param  {Object} column
 * @param  {String} columnKey
 */
ElasticsearchMigrator.prototype._definePolygon = function (mapping, schemaKey, column, columnKey) {
  return this._defineShape(mapping, schemaKey, column, columnKey);
};

/**
 * Define a shape mapping.
 *
 * @protected
 * @param  {Object} mapping
 * @param  {String} schemaKey
 * @param  {Object} column
 * @param  {String} columnKey
 */
ElasticsearchMigrator.prototype._defineShape = function (mapping, schemaKey, column, columnKey) {
  mapping[schemaKey].properties[columnKey] = {
    type: 'geo_shape',
    tree: 'quadtree',
    precision: '10m'
  };
};

/**
 * Define a date mapping.
 *
 * @protected
 * @param  {Object} mapping
 * @param  {String} schemaKey
 * @param  {Object} column
 * @param  {String} columnKey
 */
ElasticsearchMigrator.prototype._defineDate = function (mapping, schemaKey, column, columnKey) {
  mapping[schemaKey].properties[columnKey] = {
    type: 'date',
    format: 'yyyy-MM-dd'
  };
};

/**
 * Define a datetime mapping.
 *
 * @protected
 * @param  {Object} mapping
 * @param  {String} schemaKey
 * @param  {Object} column
 * @param  {String} columnKey
 */
ElasticsearchMigrator.prototype._defineDatetime = function (mapping, schemaKey, column, columnKey) {
  mapping[schemaKey].properties[columnKey] = {
    type: 'date',
    format: 'yyyy-MM-dd HH:mm:ss'
  };
};

/**
 * Define a float mapping.
 *
 * @protected
 * @param  {Object} mapping
 * @param  {String} schemaKey
 * @param  {Object} column
 * @param  {String} columnKey
 */
ElasticsearchMigrator.prototype._defineFloat = function (mapping, schemaKey, column, columnKey) {
  mapping[schemaKey].properties[columnKey] = {
    type: 'float'
  };
};

/**
 * Define a integer mapping.
 *
 * @protected
 * @param  {Object} mapping
 * @param  {String} schemaKey
 * @param  {Object} column
 * @param  {String} columnKey
 */
ElasticsearchMigrator.prototype._defineInteger = function (mapping, schemaKey, column, columnKey) {
  mapping[schemaKey].properties[columnKey] = {
    type: 'integer'
  };
};

/**
 * Define a boolean mapping.
 *
 * @protected
 * @param  {Object} mapping
 * @param  {String} schemaKey
 * @param  {Object} column
 * @param  {String} columnKey
 */
ElasticsearchMigrator.prototype._defineBoolean = function (mapping, schemaKey, column, columnKey) {
  mapping[schemaKey].properties[columnKey] = {
    type: 'boolean'
  };
};

module.exports = ElasticsearchMigrator;
