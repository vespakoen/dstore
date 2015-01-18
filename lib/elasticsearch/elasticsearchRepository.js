'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var ItemRepository = require('../item/itemRepository');

/**
 * @class elasticsearch.ElasticsearchReposirory
 * ElasticsearchRepository
 * 
 * @param {elasticsearch.ElasticsearchSerializer} serializer
 * @param {elasticsearch.ElasticsearchClient}     client
 * @param {schema.SchemaAdapter}                  schemaAdapter
 * @param {item.ItemTransformer}                  itemTransformer
 */
function ElasticsearchRepository(serializer, client, schemaAdapter, itemTransformer) {
  ItemRepository.call(this, schemaAdapter, itemTransformer);
  this.serializer = serializer;
  this.client = client;
}

ElasticsearchRepository.prototype = Object.create(ItemRepository.prototype);

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
    app.get('item.transformer')
  ).spread(function (serializer, client, schemaAdapter, itemTransformer) {
    return new ElasticsearchRepository(serializer, client, schemaAdapter, itemTransformer);
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
        index: namespace + 'v' + item.version,
        type: memo.schema.es_type,
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
 * @param  {Object} id
 *
 * @return {BBPromise}
 */
ElasticsearchRepository.prototype.delItem = function (namespace, schemaKey, version, id) {
  var self = this;

  return this._validateDelItem(namespace, schemaKey, id)
    .then(function () {
      // delete the item
      return self.client.delete({
        index: namespace + 'v' + version,
        type: schemaKey,
        id: id
      });
    });
};

module.exports = ElasticsearchRepository;
