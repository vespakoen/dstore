'use strict';

var BBPromise = require('bluebird');

/**
 * LevelFacade
 * 
 * @class storage.level.LevelFacade
 *
 * @param {storage.level.LevelRepository} repository
 * @param {storage.level.LevelSerializer} serializer
 * @param {storage.level.LevelDropper}    dropper
 */
function LevelFacade(repository, serializer, dropper) {
  this.repository = repository;
  this.serializer = serializer;
  this.dropper = dropper;
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
    app.get('storage.level.serializer'),
    app.get('storage.level.dropper')
  ).spread(function(repository, serializer, dropper) {
    return new LevelFacade(repository, serializer, dropper);
  });
};

/**
 * Retrieve item (FOR TESTING PURPOSE ONLY)
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {Number} projectVersion
 * @param  {String} id
 *
 * @return {BBPromise}
 */
LevelFacade.prototype.getItem = function (projectId, blueprintId, projectVersion, id) {
  return this.repository.getItem(projectId, blueprintId, projectVersion, id);
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
 * Insert / update item at single version
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {String} id
 * @param  {Object} item
 *
 * @return {BBPromise}
 */
LevelFacade.prototype.putItemForSingleVersion = function(projectId, blueprintId, id, item) {
  return this.repository.putItemForSingleVersion(projectId, blueprintId, id, item);
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
  return this.repository.delItemForAllVersions(projectId, blueprintId, id);
};

/**
 * Migrate
 *
 *  Here we simply return a truthy promise
 *  Since leveldb is schemaless and no migrations
 *  have to be done.
 * 
 * @return {BBPromise}
 */
LevelFacade.prototype.migrate = function() {
  return BBPromise.resolve(true);
};

/**
 * Drop
 *
 * @return {BBPromise}
 */
LevelFacade.prototype.drop = function(projectId) {
  return this.dropper.drop(projectId);
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

module.exports = LevelFacade;
