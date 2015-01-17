'use strict';

var _ = require('underscore');
var moment = require('moment');
var knex = require('knex')({dialect: 'postgres'});
var st = require('knex-postgis')(knex);
var ItemSerializer = require('../item/itemSerializer');

function PostgresqlSerializer(schemaAdapter) {
  ItemSerializer.call(this, schemaAdapter);
}

PostgresqlSerializer.attachKey = 'postgresql.serializer';

PostgresqlSerializer.attach = function(app) {
  return app.get('schema.adapter').then(function(schemaAdapter) {
    return new PostgresqlSerializer(schemaAdapter);
  });
};

PostgresqlSerializer.prototype = Object.create(ItemSerializer.prototype);

PostgresqlSerializer.prototype.serialize = function(namespace, schemaKey, item) {
  return this._serializeItem(namespace, schemaKey, item);
};

PostgresqlSerializer.prototype._serializePoint = function(value) {
  return this._serializeGeoJSON(value);
};

PostgresqlSerializer.prototype._serializeLinestring = function(value) {
  return this._serializeGeoJSON(value);
};

PostgresqlSerializer.prototype._serializeRectangle = function(value) {
  return this._serializeGeoJSON(value);
};

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
