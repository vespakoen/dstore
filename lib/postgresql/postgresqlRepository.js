'use strict';

var _ = require('underscore');
var Promise = require('bluebird');
var ItemRepository = require('../item/itemRepository');

function PostgresqlRepository(adapter, serializer, schemaAdapter, itemTransformer) {
  ItemRepository.call(this, schemaAdapter, itemTransformer);
  this.adapter = adapter;
  this.serializer = serializer;
}

PostgresqlRepository.prototype = Object.create(ItemRepository.prototype);

PostgresqlRepository.attachKey = 'postgresql.repository';

PostgresqlRepository.attach = function(app) {
  return Promise.join(
    app.get('postgresql.adapter'),
    app.get('postgresql.serializer'),
    app.get('schema.adapter'),
    app.get('item.transformer')
  ).spread(function (adapter, serializer, schemaAdapter, itemTransformer) {
    return new PostgresqlRepository(adapter, serializer, schemaAdapter, itemTransformer);
  });
};

PostgresqlRepository.prototype.putItem = function (namespace, schemaKey, item) {
  var self = this;
  var opts = {};

  return this._validatePutItem(namespace, schemaKey, item)
    .then(function (schema) {
      opts.schema = schema;
      opts.client = self.adapter.getClient(namespace, item.version);
      return self.serializer.serialize(namespace, schemaKey, item);
    })
    .then(function (compatibleItem) {
      opts.compatibleItem = compatibleItem;
      var table = opts.table = opts.schema.table;

      return opts.client.table(table)
        .first()
        .where({
          id: item.id
        })
        .then(function(row) {
          return row;
        });
    })
    .then(function (row) {
      if (row) {
        // update
        return opts.client.table(opts.table)
          .where({
            id: item.id
          })
          .update(opts.compatibleItem)
          // triggers knex.js's promise strategy
          .then(function () {});
      } else {
        // insert
        return opts.client.table(opts.table)
          .insert(opts.compatibleItem)
          // triggers knex.js's promise strategy
          .then(function () {});
      }
    });
};

PostgresqlRepository.prototype.delItem = function (namespace, schemaKey, version, id) {
  var self = this;

  return this._validateDelItem(namespace, schemaKey, id)
    .then(function () {
      var schemaClient = self.schemaAdapter.getClient(namespace);
      return schemaClient.getSnapshot(version);
    })
    .then(function (snapshot) {
      var schema = snapshot[schemaKey];
      var table = schema.table;
      var client = self.adapter.getClient(namespace, version);

      return client
        .table(table)
        .where({
          id: id
        })
        .del()
        .then(function () {}); // triggers knex.js's promise strategy
    });
};

module.exports = PostgresqlRepository;
