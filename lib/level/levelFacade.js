'use strict';

var Promise = require('bluebird');
var map = require('map-stream');
var bytewiseCodec = require('level-sublevel/codec/bytewise');

/**
 * @class level.LevelFacade
 * LevelFacade
 *
 * @param {level.LevelRepository} repository
 * @param {level.LevelSerializer} serializer
 */
function LevelFacade(repository, serializer) {
  this.repository = repository;
  this.serializer = serializer;
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
LevelFacade.attachKey = 'level.facade';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {Promise|Object} The object with resolved dependencies
 */
LevelFacade.attach = function(app) {
  return Promise.join(
    app.get('level.repository'),
    app.get('level.serializer')
  ).spread(function(repository, serializer) {
    return new LevelFacade(repository, serializer);
  });
};

/**
 * Insert / update item
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {Object} item
 *
 * @return {Promise}
 */
LevelFacade.prototype.putItem = function(namespace, schemaKey, item) {
  return this.repository.putItem(namespace, schemaKey, item);
};

/**
 * Delete item
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {Number} version
 * @param  {String} id
 *
 * @return {Promise}
 */
LevelFacade.prototype.delItem = function(namespace, schemaKey, version, id) {
  return this.repository.delItem(namespace, schemaKey, version, id);
};

/**
 * Serialize an item to make it compatible with leveldb.
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {Object} item
 * @return {Object} The serialized item
 */
LevelFacade.prototype.serialize = function(namespace, schemaKey, item) {
  return this.serializer.serializer(namespace, schemaKey, item);
};

/**
 * Get a id => type map.
 *
 * @param  {String} namespace
 * @param  {Number} version
 * @param  {Array} ids
 * @return {Promise}
 */
LevelFacade.prototype.getIdToTypeMap = function(namespace, version, ids) {
  return this.repository.getIdToTypeMap(namespace, version, ids);
};

/**
 * Get a stream of all items.
 *
 * @param  {String} namespace
 * @param  {Number} version
 * @return {Stream}
 */
LevelFacade.prototype.getStream = function (namespace, version) {
  return this.repository.getStream(namespace, version);
};

module.exports = LevelFacade;
