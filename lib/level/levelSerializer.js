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
 * @param {blueprint.BlueprintAdapter} blueprintAdapter
 */
function LevelSerializer(blueprintAdapter) {
  ItemSerializer.call(this, blueprintAdapter);
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
  return app.get('blueprint.adapter').then(function(blueprintAdapter) {
    return new LevelSerializer(blueprintAdapter);
  });
};

LevelSerializer.prototype = Object.create(ItemSerializer.prototype);
LevelSerializer.prototype.constructor = LevelSerializer;

/**
 * Serialize item for leveldb
 *
 * @param  {String} namespace
 * @param  {String} blueprintKey
 * @param  {Object} item
 *
 * @return {Object} The serialized item
 */
LevelSerializer.prototype.serialize = function(namespace, blueprintKey, item) {
  return this._serializeItem(namespace, blueprintKey, item);
};

module.exports = LevelSerializer;
