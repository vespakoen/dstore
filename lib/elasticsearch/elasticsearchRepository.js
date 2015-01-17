'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');;
var ItemRepository = require('../item/itemRepository');

function ElasticsearchRepository(serializer, client, schemaAdapter, itemTransformer) {
  ItemRepository.call(this, schemaAdapter, itemTransformer);
  this.serializer = serializer;
  this.client = client;
}

ElasticsearchRepository.prototype = Object.create(ItemRepository.prototype);

ElasticsearchRepository.attachKey = 'elasticsearch.repository';

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
