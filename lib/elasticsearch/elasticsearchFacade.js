'use strict';

var _ = require('underscore'),
    Promise = require('bluebird');

/**
 * @class elasticsearch.ElasticsearchFacade
 * ElasticsearchFacade
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
 * @return {Promise|Object} The object with resolved dependencies
 */
ElasticsearchFacade.attach = function(app) {
  return Promise.join(
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
 * @param  {Object} item
 *
 * @return {Promise.<null>}
 */
ElasticsearchFacade.prototype.putItem = function(namespace, schemaKey, item) {
  return this.repository.putItem(namespace, schemaKey, item);
};

/**
 * Delete item.
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {Object} id
 *
 * @return {Promise.<null>}
 */
ElasticsearchFacade.prototype.delItem = function(namespace, schemaKey, id) {
  return this.repository.delItem(namespace, schemaKey, id);
};

/**
 * Create a new elasticsearch index version and put the mapping.
 *
 * @param  {String} namespace
 * @param  {Number} version
 *
 * @return {Promise.<null>}
 */
ElasticsearchFacade.prototype.migrate = function(namespace, version) {
  return this.migrator.migrate(namespace, version);
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
