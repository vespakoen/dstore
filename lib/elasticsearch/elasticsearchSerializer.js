'use strict';

var _ = require('underscore');
var moment = require('moment');
var ItemSerializer = require('../item/itemSerializer');

/**
 * @class elasticsearch.ElasticsearchSerializer
 * @extends {item.ItemSerializer}
 * 
 * ElasticsearchSerializer
 */
function ElasticsearchSerializer(schemaAdapter) {
  ItemSerializer.call(this, schemaAdapter);
}

ElasticsearchSerializer.prototype = Object.create(ItemSerializer.prototype);

/**
 * IOC attachKey.
 *
 * @type {String}
 */
ElasticsearchSerializer.attachKey = 'elasticsearch.serializer';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {BBPromise} An ElasticsearchSerializer instance with resolved dependencies.
 */
ElasticsearchSerializer.attach = function(app) {
  return app.get('schema.adapter').then(function(schemaAdapter) {
    return new ElasticsearchSerializer(schemaAdapter);
  });
};


/**
 * Serialize item for elasticsearch.
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {Object} item
 * @return {Object} The serialized item
 */
ElasticsearchSerializer.prototype.serialize = function(namespace, schemaKey, item) {
  return this._serializeItem(namespace, schemaKey, item);
};

/**
 * Serialize a point.
 *
 * @protected
 * @param  {string} value
 */
ElasticsearchSerializer.prototype._serializePoint = function(value) {
  if (_.isString(value)) {
    value = JSON.parse(value);
  }
  if (!value || !value.coordinates) {
    return undefined;
  }
  return value.coordinates;
};

/**
 * Serialize a linestring.
 *
 * @protected
 * @param  {string} value
 */
ElasticsearchSerializer.prototype._serializeLinestring = function(value) {
  if (_.isString(value)) {
    value = JSON.parse(value);
  }
  return value;
};

/**
 * Serialize a rectangle.
 *
 * @protected
 * @param  {string} value
 */
ElasticsearchSerializer.prototype._serializeRectangle = function(value) {
  if (_.isString(value)) {
    value = JSON.parse(value);
  }
  return value;
};

module.exports = ElasticsearchSerializer;
