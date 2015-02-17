'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');

/**
 * LevelFacade
 *
 * @class postgresql.PostgresqlFacade
 * 
 * @param {postgresql.PostgresqlRepository} repository
 * @param {postgresql.PostgresqlSerializer} serializer
 * @param {postgresql.PostgresqlMigrator}   migrator
 */
function PostgresqlFacade(repository, serializer, migrator) {
  this.repository = repository;
  this.serializer = serializer;
  this.migrator = migrator;
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
PostgresqlFacade.attachKey = 'postgresql.facade';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {BBPromise} A PostgresqlFacade instance with resolved dependencies
 */
PostgresqlFacade.attach = function(app) {
  return BBPromise.join(
    app.get('postgresql.repository'),
    app.get('postgresql.serializer'),
    app.get('postgresql.migrator')
  ).spread(function(repostory, serializer, migrator) {
    return new PostgresqlFacade(repostory, serializer, migrator);
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
PostgresqlFacade.prototype.delItem = function(projectId, blueprintId, id) {
  return this.repository.delItem(projectId, blueprintId, id);
};

/**
 * Create / migrate database.
 *
 * @param  {String} projectId
 * @param  {Number} snapshotVersion
 * @param  {Object} blueprints
 *
 * @return {BBPromise.<undefined>}
 */
PostgresqlFacade.prototype.migrate = function(projectId, snapshotVersion, blueprints) {
  return this.migrator.migrate(projectId, snapshotVersion, blueprints);
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
