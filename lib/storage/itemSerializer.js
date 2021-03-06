
'use strict';

var _ = require('underscore');
var moment = require('moment');
var help = require('../helpers');

/**
 * Base class for other serializers
 * 
 * @class storage.ItemSerializer
 *
 * @param {project.blueprint.BlueprintService} blueprintService
 */
function ItemSerializer(blueprintService) {
  this.blueprintService = blueprintService;
}

/**
 * Serialize an item.
 *
 * @protected
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {Object} item
 * @return {Object} The serialized item
 */
ItemSerializer.prototype._serializeItem = function (projectId, blueprintId, item) {
  var self = this;

  return this.blueprintService.getBlueprint(projectId, blueprintId, item.project_version)
    .then(function(blueprint) {
      var column;
      var columns = blueprint.columns;
      
      Object.keys(item).forEach(function (key) {
        if (columns[key]) {
          column = columns[key];

          // if the given value is null, use default value when present
          if (item[key] === null && column.hasOwnProperty('default')) {
            item[key] = column.default;
          }

          if (item[key] === null) {
            return;
          }

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
  return _.map(value, this._serializeString);
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
  return _.map(value, this._serializeText);
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
  return _.map(value, this._serializeUuid);
};

/**
 * Serialize an integer.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeInteger = function(value) {
  return value;
};

/**
 * Serialize an integer array.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeIntegerArray = function(value) {
  return _.map(value, this._serializeInteger, this);
};

/**
 * Serialize a float.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeFloat = function(value) {
  return value;
};

/**
 * Serialize an float array.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeFloatArray = function(value) {
  return _.map(value, this._serializeFloat, this);
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
  return _.map(value, this._serializeDatetime, this);
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
  return _.map(value, this._serializeDate, this);
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
  return _.map(value, this._serializeBoolean, this);
};

/**
 * Serialize to json.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeJson = function(value) {
  return value;
};

/**
 * Serialize to array of json.
 *
 * @protected
 * @param  {string} value
 */
ItemSerializer.prototype._serializeJsonArray = function(value) {
  return _.map(value, this._serializeJson, this);
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
