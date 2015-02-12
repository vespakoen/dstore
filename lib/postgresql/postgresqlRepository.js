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
 * @param {blueprint.BlueprintAdapter}            blueprintAdapter
 * @param {item.ItemTransformer}            itemTransformer
 * @param {Validator}                       validator
 */
function PostgresqlRepository(adapter, serializer, blueprintAdapter, itemTransformer, validator) {
  ItemRepository.call(this, blueprintAdapter, itemTransformer, validator);
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
    app.get('blueprint.adapter'),
    app.get('item.transformer'),
    app.get('validator')
  ).spread(function (adapter, serializer, blueprintAdapter, itemTransformer, validator) {
    return new PostgresqlRepository(adapter, serializer, blueprintAdapter, itemTransformer, validator);
  });
};

/**
 * Insert / update item
 *
 * @param  {String} namespace
 * @param  {String} blueprintKey
 * @param  {Object} item
 *
 * @return {BBPromise}
 */
PostgresqlRepository.prototype.putItem = function (namespace, blueprintKey, id, item) {
  var self = this;
  var opts = {
    id: id,
    item: item
  };

  return this._validatePutItem(namespace, blueprintKey, id, item)
    .then(function (blueprint) {
      opts.blueprint = blueprint;
      opts.client = self.adapter.getClient(namespace, item.snapshot_version);
      return self.serializer.serialize(namespace, blueprintKey, item);
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
 * @param  {String} blueprintKey
 * @param  {Number} snapshotVersion
 * @param  {String} id
 *
 * @return {BBPromise}
 */
PostgresqlRepository.prototype.delItem = function (namespace, blueprintKey, id) {
  var self = this;

  // return this._validateDelItem(namespace, blueprintKey, id)
  //   .then(function () {
  //     var blueprintClient = self.blueprintAdapter.getClient(namespace);
  //     return blueprintClient.getSnapshot(snapshotVersion);
  //   })
  //   .then(function (snapshot) {
  //     var blueprint = snapshot[blueprintKey];
  //     var table = blueprint.table;
  //     var client = self.adapter.getClient(namespace, snapshotVersion);

  //     return client
  //       .table(table)
  //       .where({
  //         id: id
  //       })
  //       .del()
  //       // triggers knex.js's promise strategy
  //       .then(function () {});
  //   });
};

/**
 * Checks if an item already exists in the database.
 * 
 * @param  {Object} opts        Options
 * @param  {Object} opts.blueprint Blueprint options
 * @param  {Object} opts.item   The item
 * 
 * @return {BBPromise}   Promise resolving true or false (exists or doesn't exist).
 */
PostgresqlRepository.prototype._itemExists = function (opts) {
  return opts.client.table(opts.blueprint.table)
    .first()
    .where({
      id: opts.id
    })
    .then(function(row) {
      return !!row;
    });
};

/**
 * Updates an item in the database.
 * 
 * @param  {Object} opts                 Options
 * @param  {Object} opts.blueprint          Blueprint options
 * @param  {Object} opts.item            The item
 * @param  {Object} opts.compatibleItem  The serialized item
 * 
 * @return {BBPromise}
 */
PostgresqlRepository.prototype._updateItem = function (opts) {
  return opts.client.table(opts.blueprint.table)
    .where({
      id: opts.id
    })
    .update(opts.compatibleItem)
    // triggers knex.js's promise strategy
    .then(function () {});
};

/**
 * Inserts a new item into the database.
 * 
 * @param  {Object} opts                 Options
 * @param  {Object} opts.blueprint          Blueprint options
 * @param  {Object} opts.compatibleItem  The serialized item
 * 
 * @return {BBPromise}
 */
PostgresqlRepository.prototype._insertItem = function (opts) {
  return opts.client.table(opts.blueprint.table)
    .insert(opts.compatibleItem)
    // triggers knex.js's promise strategy
    .then(function () {});
};

module.exports = PostgresqlRepository;
