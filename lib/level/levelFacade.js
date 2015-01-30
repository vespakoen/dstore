'use strict';

var BBPromise = require('bluebird');
var map = require('map-stream');
var bytewiseCodec = require('level-sublevel/codec/bytewise');

/**
 * LevelFacade
 * 
 * @class level.LevelFacade
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
 * @return {BBPromise|Object} The object with resolved dependencies
 */
LevelFacade.attach = function(app) {
  return BBPromise.join(
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
 * @param  {String} id
 * @param  {Object} item
 *
 * @return {BBPromise}
 */
LevelFacade.prototype.putItem = function(namespace, schemaKey, id, item) {
  return this.repository.putItem(namespace, schemaKey, id, item);
};

/**
 * Delete item
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {String} id
 *
 * @return {BBPromise}
 */
LevelFacade.prototype.delItem = function(namespace, schemaKey, id) {
  return this.repository.delItem(namespace, schemaKey, id);
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
 * @param  {Number} snapshotVersion
 * @param  {Array} ids
 * @return {BBPromise}
 */
LevelFacade.prototype.getIdToTypeMap = function(namespace, snapshotVersion, ids) {
  return this.repository.getIdToTypeMap(namespace, snapshotVersion, ids);
};

/**
 * Get a stream of all items.
 *
 * @param  {String} namespace
 * @param  {Number} snapshotVersion
 * @return {Stream}
 */
LevelFacade.prototype.getStream = function (namespace, snapshotVersion) {
  return this.repository.getStream(namespace, snapshotVersion);
};

module.exports = LevelFacade;
