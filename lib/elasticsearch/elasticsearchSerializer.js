'use strict';

var _ = require('underscore');
var moment = require('moment');
var ItemSerializer = require('../item/itemSerializer');

/**
 * ElasticsearchSerializer
 * 
 * @class elasticsearch.ElasticsearchSerializer
 * @extends {item.ItemSerializer}
 * 
 * @param {blueprint.BlueprintAdapter} blueprintAdapter
 */
function ElasticsearchSerializer(blueprintAdapter) {
  ItemSerializer.call(this, blueprintAdapter);
}

ElasticsearchSerializer.prototype = Object.create(ItemSerializer.prototype);
ElasticsearchSerializer.prototype.constructor = ElasticsearchSerializer;

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
  return app.get('blueprint.adapter').then(function(blueprintAdapter) {
    return new ElasticsearchSerializer(blueprintAdapter);
  });
};


/**
 * Serialize item for elasticsearch.
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {Object} item
 * @return {Object} The serialized item
 */
ElasticsearchSerializer.prototype.serialize = function(projectId, blueprintId, item) {
  return this._serializeItem(projectId, blueprintId, item);
};

/**
 * Serialize a point.
 *
 * @protected
 * @param  {string} value
 */
ElasticsearchSerializer.prototype._serializePoint = function(value) {
  if (!value || !value.coordinates) {
    return null;
  }
  return value.coordinates;
};

/**
 * Serialize a point.
 *
 * @protected
 * @param  {string} value
 */
ElasticsearchSerializer.prototype._serializePointArray = function(value) {
  return this._serializePoint(value);
};

module.exports = ElasticsearchSerializer;
