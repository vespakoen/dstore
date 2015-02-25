'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');

/**
 * LevelFacade
 *
 * @class storage.postgresql.PostgresqlFacade
 * 
 * @param {storage.postgresql.PostgresqlRepository} repository
 * @param {storage.postgresql.PostgresqlSerializer} serializer
 * @param {storage.postgresql.PostgresqlMigrator}   migrator
 * @param {storage.postgresql.PostgresqlDropper}    dropper
 */
function PostgresqlFacade(repository, serializer, migrator, dropper) {
  this.repository = repository;
  this.serializer = serializer;
  this.migrator = migrator;
  this.dropper = dropper;
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
PostgresqlFacade.attachKey = 'storage.postgresql.facade';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {BBPromise} A PostgresqlFacade instance with resolved dependencies
 */
PostgresqlFacade.attach = function(app) {
  return BBPromise.join(
    app.get('storage.postgresql.repository'),
    app.get('storage.postgresql.serializer'),
    app.get('storage.postgresql.migrator'),
    app.get('storage.postgresql.dropper')
  ).spread(function(repostory, serializer, migrator, dropper) {
    return new PostgresqlFacade(repostory, serializer, migrator, dropper);
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
PostgresqlFacade.prototype.putItem = function(projectId, blueprintId, id, item) {
  return this.repository.putItemForAllVersions(projectId, blueprintId, id, item);
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
PostgresqlFacade.prototype.delItem = function(projectId, blueprintId, id) {
  return this.repository.delItemForAllVersions(projectId, blueprintId, id);
};

/**
 * Create / migrate database.
 *
 * @param  {String} projectId
 * @param  {Number} projectVersion
 * @param  {Object} blueprints
 *
 * @return {BBPromise.<undefined>}
 */
PostgresqlFacade.prototype.migrate = function(projectId, projectVersion, blueprints) {
  return this.migrator.migrate(projectId, projectVersion, blueprints);
};

/**
 * Drop all databases of a project.
 * 
 * @return {BBPromise}
 */
PostgresqlFacade.prototype.drop = function(projectId) {
  return this.dropper.drop(projectId);
};

/**
 * Serialize an item to make it compatible with postgresql.
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {Object} item
 * @return {Object} The serialized item
 */
PostgresqlFacade.prototype.serialize = function(projectId, blueprintId, item) {
  return this.serializer.serializer(projectId, blueprintId, item);
};

module.exports = PostgresqlFacade;
