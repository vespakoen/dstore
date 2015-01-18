'use strict';

var _ = require('underscore');
var moment = require('moment');
var knex = require('knex')({dialect: 'postgres'});
var st = require('knex-postgis')(knex);
var ItemSerializer = require('../item/itemSerializer');

/**
 * @class postgresql.PostgresqlSerializer
 * @extends {item.ItemSerializer}
 *
 * PostgresqlSerializer
 */
function PostgresqlSerializer(schemaAdapter) {
  ItemSerializer.call(this, schemaAdapter);
}

PostgresqlSerializer.prototype = Object.create(ItemSerializer.prototype);

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
 * Serialize a linestring.
 *
 * @protected
 * @param  {string} value
 */
PostgresqlSerializer.prototype._serializeLinestring = function(value) {
  return this._serializeGeoJSON(value);
};

/**
 * Serialize a rectangle.
 *
 * @protected
 * @param  {string} value
 */
PostgresqlSerializer.prototype._serializeRectangle = function(value) {
  return this._serializeGeoJSON(value);
};

/**
 * Serialize to geojson.
 *
 * @protected
 * @param  {string} value
 */
PostgresqlSerializer.prototype._serializeGeoJSON = function(value) {
  if (_.isString(value)) {
    var geoJson = JSON.parse(value);
    geoJson.crs = {
      type: 'name',
      properties: {name: 'EPSG:4326'}
    };
    value = st.geomFromGeoJSON(geoJson);
  }
  return value;
};

module.exports = PostgresqlSerializer;
