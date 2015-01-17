'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var ItemSerializer = require('../item/itemSerializer');

/**
 * @class level.LevelSerializer
 * @extends {Serializer}
 *
 * LevelSerializer
 */
function LevelSerializer() {}

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
 * @return {Promise|Object} The object with resolved dependencies
 */
LevelSerializer.attach = function(app) {
  return new LevelSerializer();
};

LevelSerializer.prototype = Object.create(ItemSerializer.prototype);

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
  var self = this;

  return new BBPromise(function(resolve) {
    item.links = _.uniq(item.links || []);
    resolve(self._sortKeys(item));
  });
};

module.exports = LevelSerializer;
