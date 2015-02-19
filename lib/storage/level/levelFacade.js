'use strict';

var BBPromise = require('bluebird');
var map = require('map-stream');
var bytewiseCodec = require('level-sublevel/codec/bytewise');

/**
 * LevelFacade
 * 
 * @class storage.level.LevelFacade
 *
 * @param {storage.level.LevelRepository} repository
 * @param {storage.level.LevelSerializer} serializer
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
LevelFacade.attachKey = 'storage.level.facade';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {BBPromise|Object} The object with resolved dependencies
 */
LevelFacade.attach = function(app) {
  return BBPromise.join(
    app.get('storage.level.repository'),
    app.get('storage.level.serializer')
  ).spread(function(repository, serializer) {
    return new LevelFacade(repository, serializer);
  });
};

/**
 * Insert / update item
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {String} id
 * @param  {Object} item
 *
 * @return {BBPromise}
 */
LevelFacade.prototype.putItem = function(projectId, blueprintId, id, item) {
  return this.repository.putItem(projectId, blueprintId, id, item);
};

/**
 * Delete item
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {String} id
 *
 * @return {BBPromise}
 */
LevelFacade.prototype.delItem = function(projectId, blueprintId, id) {
  return this.repository.delItem(projectId, blueprintId, id);
};

/**
 * Serialize an item to make it compatible with leveldb.
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {Object} item
 * @return {Object} The serialized item
 */
LevelFacade.prototype.serialize = function(projectId, blueprintId, item) {
  return this.serializer.serializer(projectId, blueprintId, item);
};

/**
 * Get a id => type map.
 *
 * @param  {String} projectId
 * @param  {Number} projectVersion
 * @param  {Array} ids
 * @return {BBPromise}
 */
LevelFacade.prototype.getIdToTypeMap = function(projectId, projectVersion, ids) {
  return this.repository.getIdToTypeMap(projectId, projectVersion, ids);
};

/**
 * Get a stream of all items.
 *
 * @param  {String} projectId
 * @param  {Number} projectVersion
 * @return {Stream}
 */
LevelFacade.prototype.getStream = function (projectId, projectVersion) {
  return this.repository.getStream(projectId, projectVersion);
};

module.exports = LevelFacade;
