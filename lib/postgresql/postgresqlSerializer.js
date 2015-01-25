'use strict';

var _ = require('underscore');
var moment = require('moment');
var knex = require('knex')({dialect: 'postgres'});
var st = require('knex-postgis')(knex);
var ItemSerializer = require('../item/itemSerializer');

/**
 * PostgresqlSerializer
 *
 * @class postgresql.PostgresqlSerializer
 * @extends {item.ItemSerializer}
 * 
 * @param {schema.SchemaAdapter} schemaAdapter
 */
function PostgresqlSerializer(schemaAdapter) {
  ItemSerializer.call(this, schemaAdapter);
}

PostgresqlSerializer.prototype = Object.create(ItemSerializer.prototype);
PostgresqlSerializer.prototype.constructor = PostgresqlSerializer;

/**
 * IOC attachKey.
 *
 * @type {String}
 */
PostgresqlSerializer.attachKey = 'postgresql.serializer';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {BBPromise} A PostgresqlSerializer instance with resolved dependencies.
 */
PostgresqlSerializer.attach = function(app) {
  return app.get('schema.adapter').then(function(schemaAdapter) {
    return new PostgresqlSerializer(schemaAdapter);
  });
};

/**
 * Serialize item for PostgreSQL
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {Object} item
 *
 * @return {Object} The serialized item
 */
PostgresqlSerializer.prototype.serialize = function(namespace, schemaKey, item) {
  return this._serializeItem(namespace, schemaKey, item);
};

/**
 * Serialize a point.
 *
 * @protected
 * @param  {string} value
 */
PostgresqlSerializer.prototype._serializePoint = function(value) {
  return this._serializeGeoJSON(value);
};

/**
 * Serialize a point array.
 *
 * @protected
 * @param  {string} value
 */
PostgresqlSerializer.prototype._serializePointArray = function(value) {
  return this._serializeGeoJSON(value);
};

/**
 * Serialize a linestring.
 *
 * @protected
 * @param  {string} value
 */
PostgresqlSerializer.prototype._serializeLinestring = function(value) {
  return this._serializeGeoJSON(value);
};

/**
 * Serialize a linestring array.
 *
 * @protected
 * @param  {string} value
 */
PostgresqlSerializer.prototype._serializeLinestringArray = function(value) {
  return this._serializeGeoJSON(value);
};

/**
 * Serialize a polygon.
 *
 * @protected
 * @param  {string} value
 */
PostgresqlSerializer.prototype._serializePolygon = function(value) {
  return this._serializeGeoJSON(value);
};

/**
 * Serialize a polygon array.
 *
 * @protected
 * @param  {string} value
 */
PostgresqlSerializer.prototype._serializePolygonArray = function(value) {
  return this._serializeGeoJSON(value);
};

/**
 * Serialize to geojson.
 *
 * @protected
 * @param  {string} value
 */
PostgresqlSerializer.prototype._serializeGeoJSON = function(value) {
  if ( ! value.crs) {    
    value.crs = {
      type: 'name',
      properties: {name: 'EPSG:4326'}
    };
  }
  
  return st.geomFromGeoJSON(value);
};

module.exports = PostgresqlSerializer;
