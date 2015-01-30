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
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {String} id
 * @param  {Object} item
 *
 * @return {BBPromise}
 */
PostgresqlFacade.prototype.putItem = function(namespace, schemaKey, id, item) {
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
PostgresqlFacade.prototype.delItem = function(namespace, schemaKey, id) {
  return this.repository.delItem(namespace, schemaKey, id);
};

/**
 * Create / migrate database.
 *
 * @param  {String} namespace
 * @param  {Number} snapshotVersion
 *
 * @return {BBPromise.<undefined>}
 */
PostgresqlFacade.prototype.migrate = function(namespace, snapshotVersion) {
  return this.migrator.migrate(namespace, snapshotVersion);
};

/**
 * Serialize an item to make it compatible with postgresql.
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {Object} item
 * @return {Object} The serialized item
 */
PostgresqlFacade.prototype.serialize = function(namespace, schemaKey, item) {
  return this.serializer.serializer(namespace, schemaKey, item);
};

module.exports = PostgresqlFacade;
