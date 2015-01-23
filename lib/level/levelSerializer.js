'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var ItemSerializer = require('../item/itemSerializer');

/**
 * LevelSerializer
 *
 * @class level.LevelSerializer
 * @extends {item.ItemSerializer}
 * 
 * @param {schema.SchemaAdapter} schemaAdapter
 */
function LevelSerializer(schemaAdapter) {
  ItemSerializer.call(this, schemaAdapter);
}

LevelSerializer.prototype = Object.create(ItemSerializer.prototype);
LevelSerializer.prototype.constructor = LevelSerializer;

/**
 * IOC attachKey.
 *
 * @type {String}
 */
LevelSerializer.attachKey = 'level.serializer';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {BBPromise|Object} A LevelSerializer instance with resolved dependencies.
 */
LevelSerializer.attach = function(app) {
  return app.get('schema.adapter').then(function(schemaAdapter) {
    return new LevelSerializer(schemaAdapter);
  });
};

LevelSerializer.prototype = Object.create(ItemSerializer.prototype);
LevelSerializer.prototype.constructor = LevelSerializer;

/**
 * Serialize item for leveldb
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {Object} item
 *
 * @return {Object} The serialized item
 */
LevelSerializer.prototype.serialize = function(namespace, schemaKey, item) {
  return this._serializeItem(namespace, schemaKey, item);
};

module.exports = LevelSerializer;
