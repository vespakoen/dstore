'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var ItemRepository = require('../itemRepository');

/**
 * PostgresqlRepository 
 * 
 * @class storage.postgresql.PostgresqlRepository
 * @extends {storage.ItemRepository}
 * 
 * @param {storage.postgresql.PostgresqlAdapter}      adapter
 * @param {storage.postgresql.PostgresqlSerializer}   serializer
 * @param {project.blueprint.BlueprintFacade}         blueprintFacade
 * @param {storage.ItemTransformer}                   itemTransformer
 * @param {Validator}                                 validator
 */
function PostgresqlRepository(adapter, serializer, blueprintFacade, itemTransformer, validator) {
  ItemRepository.call(this, blueprintFacade, itemTransformer, validator);
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
PostgresqlRepository.attachKey = 'storage.postgresql.repository';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {BBPromise} A PostgresqlRepository instance with resolved dependencies
 */
PostgresqlRepository.attach = function(app) {
  return BBPromise.join(
    app.get('storage.postgresql.adapter'),
    app.get('storage.postgresql.serializer'),
    app.get('project.blueprint.facade'),
    app.get('storage.itemtransformer'),
    app.get('validator')
  ).spread(function (adapter, serializer, blueprintFacade, itemTransformer, validator) {
    return new PostgresqlRepository(adapter, serializer, blueprintFacade, itemTransformer, validator);
  });
};

/**
 * Insert / update item
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {Object} item
 *
 * @return {BBPromise}
 */
PostgresqlRepository.prototype.putItem = function (projectId, blueprintId, id, item) {
  var self = this;
  var opts = {
    id: id,
    item: item
  };

  return this._validatePutItem(projectId, blueprintId, id, item)
    .then(function (blueprint) {
      opts.blueprint = blueprint;
      opts.client = self.adapter.getClient(projectId, item.project_version);
      return self.serializer.serialize(projectId, blueprintId, item);
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
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {Number} projectVersion
 * @param  {String} id
 *
 * @return {BBPromise}
 */
PostgresqlRepository.prototype.delItem = function (projectId, blueprintId, id, projectVersion) {
  var self = this;

  return this._validateDelItem(projectId, blueprintId, id)
    .then(function () {
      return self.blueprintFacade.getBlueprint(projectId, blueprintId, projectVersion);
    })
    .then(function (blueprint) {
      var table = blueprint.postgresql.table;
      var client = self.adapter.getClient(projectId, projectVersion);

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
 * @param  {Object} opts            Options
 * @param  {Object} opts.blueprint  Blueprint options
 * @param  {Object} opts.item       The item
 * 
 * @return {BBPromise}   Promise resolving true or false (exists or doesn't exist).
 */
PostgresqlRepository.prototype._itemExists = function (opts) {
  return opts.client.table(opts.blueprint.postgresql.table)
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
 * @param  {Object} opts.blueprint       Blueprint options
 * @param  {Object} opts.item            The item
 * @param  {Object} opts.compatibleItem  The serialized item
 * 
 * @return {BBPromise}
 */
PostgresqlRepository.prototype._updateItem = function (opts) {
  return opts.client.table(opts.blueprint.postgresql.table)
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
 * @param  {Object} opts.blueprint       Blueprint options
 * @param  {Object} opts.compatibleItem  The serialized item
 * 
 * @return {BBPromise}
 */
PostgresqlRepository.prototype._insertItem = function (opts) {
  return opts.client.table(opts.blueprint.postgresql.table)
    .insert(opts.compatibleItem)
    // triggers knex.js's promise strategy
    .then(function () {});
};

module.exports = PostgresqlRepository;
