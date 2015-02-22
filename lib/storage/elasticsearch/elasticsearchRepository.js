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
 * @param {project.blueprint.BlueprintService}            blueprintService
 * @param {storage.ItemTransformer}                       itemTransformer
 * @param {Validator}                                     validator
 */
function ElasticsearchRepository(serializer, client, blueprintService, itemTransformer, validator) {
  ItemRepository.call(this, blueprintService, itemTransformer, validator);
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
    app.get('project.blueprint.service'),
    app.get('storage.itemtransformer'),
    app.get('validator')
  ).spread(function (serializer, client, blueprintService, itemTransformer, validator) {
    return new ElasticsearchRepository(serializer, client, blueprintService, itemTransformer, validator);
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
ElasticsearchRepository.prototype.putItem = function (projectId, blueprintId, id, item) {
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
ElasticsearchRepository.prototype.delItem = function (projectId, blueprintId, id) {
  var self = this;

  return this._validateDelItem(projectId, blueprintId, id)
    .then(function () {
      // delete the item

      // @TODO get all versions for blueprint and delete it everywhere

      // return self.client.delete({
      //   index: projectId + 'v' + projectVersion,
      //   type: blueprintId,
      //   id: id
      // });
    });
};

module.exports = ElasticsearchRepository;
