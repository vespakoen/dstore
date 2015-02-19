'use strict';

var _ = require('underscore');
var moment = require('moment');
var ItemSerializer = require('../itemSerializer');

/**
 * ElasticsearchSerializer
 * 
 * @class storage.elasticsearch.ElasticsearchSerializer
 * @extends {storage.ItemSerializer}
 * 
 * @param {storage.blueprint.BlueprintService} blueprintService
 */
function ElasticsearchSerializer(blueprintService) {
  ItemSerializer.call(this, blueprintService);
}

ElasticsearchSerializer.prototype = Object.create(ItemSerializer.prototype);
ElasticsearchSerializer.prototype.constructor = ElasticsearchSerializer;

/**
 * IOC attachKey.
 *
 * @type {String}
 */
ElasticsearchSerializer.attachKey = 'storage.elasticsearch.serializer';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {BBPromise} An ElasticsearchSerializer instance with resolved dependencies.
 */
ElasticsearchSerializer.attach = function(app) {
  return app.get('project.blueprint.service')
    .then(function(blueprintService) {
      return new ElasticsearchSerializer(blueprintService);
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
