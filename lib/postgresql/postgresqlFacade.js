'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');;

/**
 * @class postgresql.PostgresqlFacade
 * LevelFacade
 *
 * @param {postgresql.PostgresqlRepository} repository
 * @param {postgresql.PostgresqlSerializer} serializer
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
 * @return {Promise|Object} The object with resolved dependencies
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
 * @param  {Object} item
 *
 * @return {Promise}
 */
PostgresqlFacade.prototype.putItem = function(namespace, schemaKey, item) {
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
PostgresqlFacade.prototype.delItem = function(namespace, schemaKey, version, id) {
  return this.repository.delItem(namespace, schemaKey, version, id);
};

/**
 * Create / migrate database.
 *
 * @param  {String} namespace
 * @param  {Number} version
 *
 * @return {BBPromise.<null>}
 */
PostgresqlFacade.prototype.migrate = function(namespace, version) {
  return this.migrator.migrate(namespace, version);
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
