'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var ItemRepository = require('../item/itemRepository');

/**
 * PostgresqlRepository 
 * 
 * @class postgresql.PostgresqlRepository
 * @extends {item.ItemRepository}
 * 
 * @param {postgresql.PostgresqlAdapter}    adapter
 * @param {postgresql.PostgresqlSerializer} serializer
 * @param {schema.SchemaAdapter}            schemaAdapter
 * @param {item.ItemTransformer}            itemTransformer
 */
function PostgresqlRepository(adapter, serializer, schemaAdapter, itemTransformer) {
  ItemRepository.call(this, schemaAdapter, itemTransformer);
  this.adapter = adapter;
  this.serializer = serializer;
}

PostgresqlRepository.prototype = Object.create(ItemRepository.prototype);
PostgresqlRepository.prototype.constructor = PostgresqlRepository;

/**
 * IOC attachKey.
 *
 * @type {String}
 */
PostgresqlRepository.attachKey = 'postgresql.repository';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {BBPromise} A PostgresqlRepository instance with resolved dependencies
 */
PostgresqlRepository.attach = function(app) {
  return BBPromise.join(
    app.get('postgresql.adapter'),
    app.get('postgresql.serializer'),
    app.get('schema.adapter'),
    app.get('item.transformer')
  ).spread(function (adapter, serializer, schemaAdapter, itemTransformer) {
    return new PostgresqlRepository(adapter, serializer, schemaAdapter, itemTransformer);
  });
};

/**
 * Insert / update item
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {Object} item
 *
 * @return {BBPromise}
 */
PostgresqlRepository.prototype.putItem = function (namespace, schemaKey, item) {
  var self = this;
  var opts = {
    item: item
  };

  return this._validatePutItem(namespace, schemaKey, item)
    .then(function (schema) {
      opts.schema = schema;
      opts.client = self.adapter.getClient(namespace, item.snapshot_version);
      return self.serializer.serialize(namespace, schemaKey, item);
    })
    .then(function (compatibleItem) {
      opts.compatibleItem = compatibleItem;
      return self._itemExists(opts);
    })
    .then(function (exists) {
      if (exists) {
        return self._updateItem(opts);
      } else {
        return self._insertItem(opts);
      }
    });
};

/**
 * Delete item
 *
 * @param  {String} namespace
 * @param  {String} schemaKey
 * @param  {Number} snapshotVersion
 * @param  {String} id
 *
 * @return {BBPromise}
 */
PostgresqlRepository.prototype.delItem = function (namespace, schemaKey, snapshotVersion, id) {
  var self = this;

  return this._validateDelItem(namespace, schemaKey, id)
    .then(function () {
      var schemaClient = self.schemaAdapter.getClient(namespace);
      return schemaClient.getSnapshot(snapshotVersion);
    })
    .then(function (snapshot) {
      var schema = snapshot[schemaKey];
      var table = schema.table;
      var client = self.adapter.getClient(namespace, snapshotVersion);

      return client
        .table(table)
        .where({
          id: id
        })
        .del()
        // triggers knex.js's promise strategy
        .then(function () {});
    });
};

/**
 * Checks if an item already exists in the database.
 * 
 * @param  {Object} opts        Options
 * @param  {Object} opts.schema Schema options
 * @param  {Object} opts.item   The item
 * 
 * @return {BBPromise}   Promise resolving true or false (exists or doesn't exist).
 */
PostgresqlRepository.prototype._itemExists = function (opts) {
  return opts.client.table(opts.schema.table)
    .first()
    .where({
      id: opts.item.id
    })
    .then(function(row) {
      return !!row;
    });
};

/**
 * Updates an item in the database.
 * 
 * @param  {Object} opts                 Options
 * @param  {Object} opts.schema          Schema options
 * @param  {Object} opts.item            The item
 * @param  {Object} opts.compatibleItem  The serialized item
 * 
 * @return {BBPromise}
 */
PostgresqlRepository.prototype._updateItem = function (opts) {
  return opts.client.table(opts.schema.table)
    .where({
      id: opts.item.id
    })
    .update(opts.compatibleItem)
    // triggers knex.js's promise strategy
    .then(function () {});
};

/**
 * Inserts a new item into the database.
 * 
 * @param  {Object} opts                 Options
 * @param  {Object} opts.schema          Schema options
 * @param  {Object} opts.compatibleItem  The serialized item
 * 
 * @return {BBPromise}
 */
PostgresqlRepository.prototype._insertItem = function (opts) {
  return opts.client.table(opts.schema.table)
    .insert(opts.compatibleItem)
    // triggers knex.js's promise strategy
    .then(function () {});
};

module.exports = PostgresqlRepository;
