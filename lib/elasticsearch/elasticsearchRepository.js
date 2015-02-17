'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var ItemRepository = require('../item/itemRepository');

/**
 * ElasticsearchRepository
 * 
 * @class elasticsearch.ElasticsearchReposirory
 * @extends {item.ItemRepository}
 * 
 * @param {elasticsearch.ElasticsearchSerializer} serializer
 * @param {elasticsearch.ElasticsearchClient}     client
 * @param {blueprint.BlueprintAdapter}                  blueprintAdapter
 * @param {item.ItemTransformer}                  itemTransformer
 * @param {Validator}                             validator
 */
function ElasticsearchRepository(serializer, client, blueprintAdapter, itemTransformer, validator) {
  ItemRepository.call(this, blueprintAdapter, itemTransformer, validator);
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
ElasticsearchRepository.attachKey = 'elasticsearch.repository';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {BBPromise} A ElasticsearchRepository instance with resolved dependencies
 */
ElasticsearchRepository.attach = function (app) {
  return BBPromise.join(
    app.get('elasticsearch.serializer'),
    app.get('elasticsearch.client'),
    app.get('blueprint.adapter'),
    app.get('item.transformer'),
    app.get('validator')
  ).spread(function (serializer, client, blueprintAdapter, itemTransformer, validator) {
    return new ElasticsearchRepository(serializer, client, blueprintAdapter, itemTransformer, validator);
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
        index: projectId + 'v' + item.snapshot_version,
        type: memo.blueprint.elasticsearch_type,
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
 * @param  {Number} snapshotVersion
 * @param  {Object} id
 *
 * @return {BBPromise}
 */
ElasticsearchRepository.prototype.delItem = function (projectId, blueprintId, id) {
  var self = this;

  // return this._validateDelItem(projectId, blueprintId, id)
  //   .then(function () {
  //     // delete the item
  //     return self.client.delete({
  //       index: projectId + 'v' + snapshotVersion,
  //       type: blueprintId,
  //       id: id
  //     });
  //   });
};

module.exports = ElasticsearchRepository;
