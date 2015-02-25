"use strict";

var _ = require('underscore');
var BBPromise = require('bluebird');
var help = require('../../helpers');

/**
 * ElasticsearchSyncer
 * 
 * @class storage.elasticsearch.ElasticsearchSyncer
 *
 * @param {storage.elasticsearch.ElasticsearchClient} client
 * @param {storage.level.levelAdapter}                levelAdapter
 * @param {project.blueprint.BlueprintFacade}         blueprintFacade
 * @param {storage.ItemTransformer}                   itemTransformer
 */
function ElasticsearchSyncer(client, levelAdapter, blueprintFacade, itemTransformer) {
  this.client = client;
  this.levelAdapter = levelAdapter;
  this.blueprintFacade = blueprintFacade;
  this.itemTransformer = itemTransformer;
}

/**
 * IOC attachKey
 *
 * @type {String}
 */
ElasticsearchSyncer.attachKey = 'storage.elasticsearch.syncer';

/**
 * IOC attach
 *
 * @param {App} app
 *
 * @return {BBPromise|Object} The object with resolved dependencies
 */
ElasticsearchSyncer.attach = function(app) {
  return BBPromise.join(
    app.get('storage.elasticsearch.client')
    app.get('storage.level.adapter'),
    app.get('project.blueprint.facade'),
    app.get('storage.itemtransformer')
  )
  .spread(function(client, levelAdapter, blueprintFacade, itemTransformer) {
    return new ElasticsearchSyncer(client, levelAdapter, blueprintFacade, itemTransformer);
  });
};

/**
 * Create a new elasticsearch index and put the mapping.
 *
 * @param  {String} projectId
 * @param  {Number} projectVersion
 * @param  {Object} blueprints
 *
 * @return {BBPromise}
 */
ElasticsearchSyncer.prototype.sync = function(projectId, projectVersion, blueprints) {
  var client = this.levelAdapter.getClient(projectId, projectVersion - 1);

  var itemByIdDb = client.sublevel('item-by-id');
  var table = itemByTypeDb.sublevel(blueprintId);

  return itemByTypeAndIdDb.createReadStream()
    
  return BBPromise.resolve(true);
};

module.exports = ElasticsearchSyncer;
