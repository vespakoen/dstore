
'use strict';

var _ = require('underscore');
var moment = require('moment');
var help = require('../helpers');

/**
 * @class item.ItemSerializer
 * Base class for other serializers
 *
 * @param {schema.SchemaAdapter} schemaAdapter
 */
function ItemSerializer(schemaAdapter) {
  this.schemaAdapter = schemaAdapter;
}

/**
 * Serialize an item.
 *
 * @protected
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {Object} item
 * @return {Object} The serialized item
 */
ItemSerializer.prototype._serializeItem = function (namespace, schemaKey, item) {
  var self = this;

  var schemaClient = this.schemaAdapter.getClient(namespace);
  return schemaClient.getSnapshot(item.snapshot_version).then(function(schemas) {
    var column;
    var schema = schemas[schemaKey];
    var columns = schema.columns;
    
    Object.keys(item).forEach(function (key) {
      if (columns[key]) {
        column = columns[key];
        var method = '_serialize' + help.capitalizeFirstLetter(column.type).replace('[]', 'Array');
        if (self[method]) {
          item[key] = self[method](item[key]);
        }
      }
    });

    item.links = _.uniq(item.links || []);

    return item;
  });
};

/**
 * Serialize a string.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeString = function(value) {
  if (value === "") {
    return null;
  }
  return value;
};

/**
 * Serialize a string array.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeStringArray = function(value) {
  var arr = JSON.parse(value);
  return _.map(arr, this._serializeString);
};

/**
 * Serialize a text.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeText = function(value) {
  if (value === "") {
    return null;
  }
  return value;
};

/**
 * Serialize a text array.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeTextArray = function(value) {
  var arr = JSON.parse(value);
  return _.map(arr, this._serializeText);
};

/**
 * Serialize a string.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeUuid = function(value) {
  if (value === "") {
    return null;
  }
  return value;
};

/**
 * Serialize a string.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeUuidArray = function(value) {
  var arr = JSON.parse(value);
  return _.map(arr, this._serializeUuid);
};

/**
 * Serialize an integer.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeInteger = function(value) {
  return Number(value);
};

/**
 * Serialize an integer array.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeIntegerArray = function(value) {
  var arr = JSON.parse(value);
  return _.map(arr, this._serializeInteger, this);
};

/**
 * Serialize a float.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeFloat = function(value) {
  return Number(value);
};

/**
 * Serialize an float array.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeFloatArray = function(value) {
  var arr = JSON.parse(value);
  return _.map(arr, this._serializeFloat, this);
};

/**
 * Convert a date string to a date object.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._dateStringToMoment = function(value) {
  return moment(new Date(value));
};

/**
 * Serialize a datetime string to a datetime.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeDatetime = function(value) {
  return this._dateStringToMoment(value)
    .format('YYYY-MM-DD HH:mm:ss');
};

/**
 * Serialize a datetime array string to a datetime.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeDatetimeArray = function(value) {
  var arr = JSON.parse(value);
  return _.map(arr, this._serializeDatetime, this);
};

/**
 * Serialize a date string to a date.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeDate = function(value) {
  return this._dateStringToMoment(value)
    .format('YYYY-MM-DD');
};

/**
 * Serialize a date array string to a array of dates.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeDateArray = function(value) {
  var arr = JSON.parse(value);
  return _.map(arr, this._serializeDate, this);
};

/**
 * Serialize to boolean.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeBoolean = function(value) {
  return !!value;
};

/**
 * Serialize to boolean array.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeBooleanArray = function(value) {
  var arr = JSON.parse(value);
  return _.map(arr, this._serializeBoolean, this);
};

/**
 * Serialize to json.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeJson = function(value) {
  if (_.isString(value)) {
    return JSON.parse(value);
  }
  return value;
};

/**
 * Serialize to array of json.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeJsonArray = function(value) {
  var arr = JSON.parse(value);
  return _.map(arr, this._serializeJson, this);
};

/**
 * Serialize a point.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializePoint = function(value) {
  return this._serializeJson(value);
};

/**
 * Serialize a point array.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializePointArray = function(value) {
  return this._serializeJson(value);
};

/**
 * Serialize a linestring.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeLinestring = function(value) {
  return this._serializeJson(value);
};

/**
 * Serialize a linestring array.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeLinestringArray = function(value) {
  return this._serializeJson(value);
};

/**
 * Serialize a polygon.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializePolygon = function(value) {
  return this._serializeJson(value);
};

/**
 * Serialize a polygon array.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializePolygonArray = function(value) {
  return this._serializeJson(value);
};

/**
 * Sort keys of an object.
 *
 * @protected
 * @param  {Object} item
 */
ItemSerializer.prototype._sortKeys = function (item) {
  var value
    , sortedItem = {}
    , keys = _.keys(item)
    , sortedKeys = _.sortBy(keys, function(key) {
      return key;
    });

  _.each(sortedKeys, function(key) {
    value = item[key];
    sortedItem[key] = value;
  });

  return sortedItem;
};

module.exports = ItemSerializer;
