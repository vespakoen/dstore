
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
  return schemaClient.getSnapshot(item.version).then(function(schemas) {
    var column;
    var schema = schemas[schemaKey];
    var columns = schema.columns;
    for (var key in item) {
      if (columns[key]) {
        column = columns[key];
        var method = '_serialize' + help.capitalizeFirstLetter(column.type).replace('[]', 'Array');
        if (self[method]) {
          item[key] = self[method](item[key]);
        }
      }
    }
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
 * Convert a date string to a date object.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._dateStringToMoment = function(value) {
  return moment(new Date(value));
};

/**
 * Serialize a date string to a datetime.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeDatetime = function(value) {
  return this._dateStringToMoment(value)
    .format('YYYY-MM-DD HH:mm:ss');
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
 * Serialize to boolean.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeBoolean = function(value) {
  return !!value;
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
