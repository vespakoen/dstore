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
 * @param {schema.SchemaAdapter}                  schemaAdapter
 * @param {item.ItemTransformer}                  itemTransformer
 * @param {Validator}                             validator
 */
function ElasticsearchRepository(serializer, client, schemaAdapter, itemTransformer, validator) {
  ItemRepository.call(this, schemaAdapter, itemTransformer, validator);
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
    app.get('schema.adapter'),
    app.get('item.transformer'),
    app.get('validator')
  ).spread(function (serializer, client, schemaAdapter, itemTransformer, validator) {
    return new ElasticsearchRepository(serializer, client, schemaAdapter, itemTransformer, validator);
  });
};

/**
 * Insert / update item.
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {Object} item
 *
 * @return {BBPromise}
 */
ElasticsearchRepository.prototype.putItem = function (namespace, schemaKey, item) {
  var self = this;
  var memo = {};

  return this._validatePutItem(namespace, schemaKey, item)
    .then(function (schema) {
      memo.schema = schema;
       // serialize the item
      return self.serializer.serialize(namespace, schemaKey, item);
    })
    .then(function(compatibleItem) {
      // index the item
      return self.client.index({
        index: namespace + 'v' + item.snapshot_version,
        type: memo.schema.elasticsearch_type,
        id: compatibleItem.id,
        body: compatibleItem
      });
    });
};

/**
 * Delete item.
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {Number} snapshotVersion
 * @param  {Object} id
 *
 * @return {BBPromise}
 */
ElasticsearchRepository.prototype.delItem = function (namespace, schemaKey, snapshotVersion, id) {
  var self = this;

  return this._validateDelItem(namespace, schemaKey, id)
    .then(function () {
      // delete the item
      return self.client.delete({
        index: namespace + 'v' + snapshotVersion,
        type: schemaKey,
        id: id
      });
    });
};

module.exports = ElasticsearchRepository;
