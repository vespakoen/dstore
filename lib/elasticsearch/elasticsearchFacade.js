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
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {String} id
 * @param  {Object} item
 *
 * @return {BBPromise.<undefined>}
 */
ElasticsearchFacade.prototype.putItem = function(projectId, blueprintId, id, item) {
  return this.repository.putItem(projectId, blueprintId, id, item);
};

/**
 * Delete item.
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {Object} id
 *
 * @return {BBPromise.<undefined>}
 */
ElasticsearchFacade.prototype.delItem = function(projectId, blueprintId, id) {
  return this.repository.delItem(projectId, blueprintId, id);
};

/**
 * Create a new elasticsearch index and put the mapping.
 *
 * @param  {String} projectId
 * @param  {Number} snapshotVersion
 * @param  {Object} blueprints
 *
 * @return {BBPromise.<undefined>}
 */
ElasticsearchFacade.prototype.migrate = function(projectId, snapshotVersion, blueprints) {
  return this.migrator.migrate(projectId, snapshotVersion, blueprints);
};

/**
 * Serialize an item to make it compatible with elasticsearch.
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {Object} item
 * @return {Object} The serialized item
 */
ElasticsearchFacade.prototype.serialize = function(projectId, blueprintId, item) {
  return this.serializer.serializer(projectId, blueprintId, item);
};

module.exports = ElasticsearchFacade;
