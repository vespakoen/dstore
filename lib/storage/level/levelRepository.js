'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var map = require('map-stream');
var bytewiseCodec = require('level-sublevel/codec/bytewise');
var ItemRepository = require('../itemRepository');

/**
 * LevelRepository
 * 
 * @class storage.level.LevelRepository
 * @extends {storage.ItemRepository}
 * 
 * @param {storage.level.LevelSerializer}       serializer
 * @param {storage.level.LevelAdapter}          adapter
 * @param {project.blueprint.BlueprintFacade}   blueprintFacade
 * @param {storage.ItemTransformer}             itemTransformer
 * @param {Validator}                           validator
 */
function LevelRepository(serializer, adapter, blueprintFacade, itemTransformer, validator) {
  ItemRepository.call(this, blueprintFacade, itemTransformer, validator);
  this.serializer = serializer;
  this.adapter = adapter;
}

LevelRepository.prototype = Object.create(ItemRepository.prototype);
LevelRepository.prototype.constructor = LevelRepository;

/**
 * IOC attachKey.
 *
 * @type {String}
 */
LevelRepository.attachKey = 'storage.level.repository';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {BBPromise} A LevelRepository instance with resolved dependencies.
 */
LevelRepository.attach = function (app) {
  return BBPromise.join(
    app.get('storage.level.serializer'),
    app.get('storage.level.adapter'),
    app.get('project.blueprint.facade'),
    app.get('storage.itemtransformer'),
    app.get('validator')
  ).spread(function (serializer, adapter, blueprintFacade, itemTransformer, validator) {
    return new LevelRepository(serializer, adapter, blueprintFacade, itemTransformer, validator);
  });
};

/**
 * Retrieve item
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {Number} projectVersion
 * @param  {String} id
 *
 * @return {BBPromise}
 */
LevelRepository.prototype.getItem = function (projectId, blueprintId, projectVersion, id) {
  var client = this.adapter.getClient(projectId, projectVersion);
  var itemByIdDb = client.sublevel('item-by-id');
  return BBPromise.promisify(itemByIdDb.get)(id);
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
LevelRepository.prototype.putItemForSingleVersion = function (projectId, blueprintId, id, item) {
  var self = this;
  return this._validatePutItem(projectId, blueprintId, id, item)
    .then(function () {
       // serialize the item
      return self.serializer.serialize(projectId, blueprintId, item);
    })
    .then(function(item) {
      var value = JSON.stringify(item);
      var client = self.adapter.getClient(projectId, item.project_version);
      var itemByIdDb = client.sublevel('item-by-id', {
        valueEncoding: 'json'
      });
      var itemByTypeDb = client.sublevel('item-by-type');
      var table = itemByTypeDb.sublevel(blueprintId);

      return BBPromise.promisify(itemByIdDb.put)(id, item)
        .then(function () {
          return BBPromise.promisify(table.put)(id, value);
        });
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
LevelRepository.prototype.delItem = function (projectId, blueprintId, id, projectVersion) {
  var self = this;

  return this._validateDelItem(projectId, blueprintId, id)
    .then(function () {
      return self.blueprintFacade.getBlueprint(projectId, blueprintId, projectVersion);
    })
    .then(function (blueprint) {
      var type = blueprint.elasticsearch.type;
      var client = self.adapter.getClient(projectId, projectVersion);

      var itemByIdDb = client.sublevel('item-by-id');
      var itemByTypeDb = client.sublevel('item-by-type');
      var table = itemByTypeDb.sublevel(blueprintId);

      return BBPromise.promisify(itemByIdDb.del)(id)
        .then(function () {
          return BBPromise.promisify(table.del)(id);
        });
    });
};

module.exports = LevelRepository;
