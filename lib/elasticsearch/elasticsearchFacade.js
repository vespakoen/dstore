'use strict';

var _ = require('underscore'),
    BBPromise = require('bluebird');

/**
 * ElasticsearchFacade
 * 
 * @class elasticsearch.ElasticsearchFacade
 *
 * @param {elasticsearch.ElasticsearchRepository} repository
 * @param {elasticsearch.ElasticsearchMigrator} migrator
 */
function ElasticsearchFacade(repository, migrator) {
  this.repository = repository;
  this.migrator = migrator;
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
ElasticsearchFacade.attachKey = 'elasticsearch.facade';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {BBPromise} The object with resolved dependencies
 */
ElasticsearchFacade.attach = function(app) {
  return BBPromise.join(
    app.get('elasticsearch.repository'),
    app.get('elasticsearch.migrator')
  ).spread(function(repository, migrator) {
    return new ElasticsearchFacade(repository, migrator);
  });
};

/**
 * Insert / update item.
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {String} id
 * @param  {Object} item
 *
 * @return {BBPromise.<undefined>}
 */
ElasticsearchFacade.prototype.putItem = function(namespace, schemaKey, id, item) {
  return this.repository.putItem(namespace, schemaKey, id, item);
};

/**
 * Delete item.
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {Object} id
 *
 * @return {BBPromise.<undefined>}
 */
ElasticsearchFacade.prototype.delItem = function(namespace, schemaKey, id) {
  return this.repository.delItem(namespace, schemaKey, id);
};

/**
 * Create a new elasticsearch index and put the mapping.
 *
 * @param  {String} namespace
 * @param  {Number} snapshotVersion
 * @param  {Object} schemas
 *
 * @return {BBPromise.<undefined>}
 */
ElasticsearchFacade.prototype.migrate = function(namespace, snapshotVersion, schemas) {
  return this.migrator.migrate(namespace, snapshotVersion, schemas);
};

/**
 * Serialize an item to make it compatible with elasticsearch.
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {Object} item
 * @return {Object} The serialized item
 */
ElasticsearchFacade.prototype.serialize = function(namespace, schemaKey, item) {
  return this.serializer.serializer(namespace, schemaKey, item);
};

module.exports = ElasticsearchFacade;
