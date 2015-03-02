'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var ItemRepository = require('../itemRepository');

/**
 * ElasticsearchRepository
 * 
 * @class storage.elasticsearch.ElasticsearchReposirory
 * @extends {storage.ItemRepository}
 * 
 * @param {storage.elasticsearch.ElasticsearchSerializer} serializer
 * @param {storage.elasticsearch.ElasticsearchClient}     client
 * @param {project.blueprint.BlueprintFacade}             blueprintFacade
 * @param {storage.ItemTransformer}                       itemTransformer
 * @param {Validator}                                     validator
 */
function ElasticsearchRepository(serializer, client, blueprintFacade, itemTransformer, validator) {
  ItemRepository.call(this, blueprintFacade, itemTransformer, validator);
  this.serializer = serializer;
  this.client = client;
}

ElasticsearchRepository.prototype = Object.create(ItemRepository.prototype);
ElasticsearchRepository.prototype.constructor = ElasticsearchRepository;

/**
 * IOC attachKey.
 *
 * @type {String}
 */
ElasticsearchRepository.attachKey = 'storage.elasticsearch.repository';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {BBPromise} A ElasticsearchRepository instance with resolved dependencies
 */
ElasticsearchRepository.attach = function (app) {
  return BBPromise.join(
    app.get('storage.elasticsearch.serializer'),
    app.get('storage.elasticsearch.client'),
    app.get('project.blueprint.facade'),
    app.get('storage.itemtransformer'),
    app.get('validator')
  ).spread(function (serializer, client, blueprintFacade, itemTransformer, validator) {
    return new ElasticsearchRepository(serializer, client, blueprintFacade, itemTransformer, validator);
  });
};

/**
 * Insert / update item.
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {Number} projectVersion
 * @param  {String} id
 *
 * @return {BBPromise}
 */
ElasticsearchRepository.prototype.getItem = function (projectId, blueprintId, projectVersion, id) {
  var self = this;
  
  return self.blueprintFacade.getBlueprint(projectId, blueprintId, projectVersion)
    .then(function (blueprint) {
      return self.client.search({
        index: projectId + 'v' + projectVersion,
        type: blueprint.elasticsearch.type,
        id: id
      });
    });
};

/**
 * Insert / update item.
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {Object} item
 *
 * @return {BBPromise}
 */
ElasticsearchRepository.prototype.putItemForSingleVersion = function (projectId, blueprintId, id, item) {
  var self = this;
  var memo = {};

  return this._validatePutItem(projectId, blueprintId, id, item)
    .then(function (blueprint) {
      memo.blueprint = blueprint;
      // serialize the item
      return self.serializer.serialize(projectId, blueprintId, item);
    })
    .then(function(compatibleItem) {
      // index the item
      return self.client.index({
        index: projectId + 'v' + item.project_version,
        type: memo.blueprint.elasticsearch.type,
        id: id,
        body: compatibleItem
      });
    });
};

/**
 * Delete item.
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {Object} id
 *
 * @return {BBPromise}
 */
ElasticsearchRepository.prototype.delItem = function (projectId, blueprintId, id, projectVersion) {
  var self = this;

  return this._validateDelItem(projectId, blueprintId, id)
    .then(function () {
      return self.blueprintFacade.getBlueprint(projectId, blueprintId, projectVersion);
    })
    .then(function (blueprint) {
      var type = blueprint.elasticsearch.type;

      return self.client.delete({
        index: projectId + 'v' + projectVersion,
        type: type,
        id: id
      });
    });
};

module.exports = ElasticsearchRepository;
