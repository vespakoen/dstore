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
 * @param  {String} blueprintKey
 * @param  {String} id
 * @param  {Object} item
 *
 * @return {BBPromise.<undefined>}
 */
ElasticsearchFacade.prototype.putItem = function(namespace, blueprintKey, id, item) {
  return this.repository.putItem(namespace, blueprintKey, id, item);
};

/**
 * Delete item.
 *
 * @param  {String} namespace
 * @param  {String} blueprintKey
 * @param  {Object} id
 *
 * @return {BBPromise.<undefined>}
 */
ElasticsearchFacade.prototype.delItem = function(namespace, blueprintKey, id) {
  return this.repository.delItem(namespace, blueprintKey, id);
};

/**
 * Create a new elasticsearch index and put the mapping.
 *
 * @param  {String} namespace
 * @param  {Number} snapshotVersion
 * @param  {Object} blueprints
 *
 * @return {BBPromise.<undefined>}
 */
ElasticsearchFacade.prototype.migrate = function(namespace, snapshotVersion, blueprints) {
  return this.migrator.migrate(namespace, snapshotVersion, blueprints);
};

/**
 * Serialize an item to make it compatible with elasticsearch.
 *
 * @param  {String} namespace
 * @param  {String} blueprintKey
 * @param  {Object} item
 * @return {Object} The serialized item
 */
ElasticsearchFacade.prototype.serialize = function(namespace, blueprintKey, item) {
  return this.serializer.serializer(namespace, blueprintKey, item);
};

module.exports = ElasticsearchFacade;
