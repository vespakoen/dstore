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
 * @param {project.blueprint.BlueprintService}  blueprintService
 * @param {storage.ItemTransformer}             itemTransformer
 * @param {Validator}                           validator
 */
function LevelRepository(serializer, adapter, blueprintService, itemTransformer, validator) {
  ItemRepository.call(this, blueprintService, itemTransformer, validator);
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
    app.get('project.blueprint.service'),
    app.get('storage.itemtransformer'),
    app.get('validator')
  ).spread(function (serializer, adapter, blueprintService, itemTransformer, validator) {
    return new LevelRepository(serializer, adapter, blueprintService, itemTransformer, validator);
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
LevelRepository.prototype.putItem = function (projectId, blueprintId, id, item) {
  var self = this;
  
  return this._validatePutItem(projectId, blueprintId, id, item)
    .then(function () {
       // serialize the item
      return self.serializer.serialize(projectId, blueprintId, item);
    })
    .then(function(item) {
      var value = JSON.stringify(item);

      var client = self.adapter.getClient(projectId, item.project_version);
      var typeByIdDb = client.sublevel('type-by-id');
      var itemByIdDb = client.sublevel('item-by-id');
      var itemByTypeDb = client.sublevel('item-by-type');
      var table = itemByTypeDb.sublevel(blueprintId);
      var itemByTypeAndIdDb = client.sublevel('item-by-type-and-id', bytewiseCodec);

      return BBPromise.promisify(typeByIdDb.put)(id, blueprintId)
        .then(function () {
          return BBPromise.promisify(itemByIdDb.put)(id, value);
        })
        .then(function () {
          return BBPromise.promisify(table.put)(id, value);
        })
        .then(function () {
          return BBPromise.promisify(itemByTypeAndIdDb.put)([blueprintId, id], value);
        })
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
LevelRepository.prototype.delItem = function (projectId, blueprintId, id) {
  var self = this;

  return this._validateDelItem(projectId, blueprintId, id)
    .then(function () {
      
    });
};

/**
 * Get a id => type map.
 *
 * @param  {String} projectId
 * @param  {Number} projectVersion
 * @param  {Array} ids
 * @return {BBPromise}
 */
LevelRepository.prototype.getIdToTypeMap = function(projectId, projectVersion, ids) {
  var self = this;

  return new BBPromise(function(resolve) {
    var i,
        idsMap = {},
        results = {};

    ids.forEach(function (id) {
      idsMap[id] = true;
    });
    
    var client = self.adapter.getClient(projectId, projectVersion);
    var typeByIdDb = client.sublevel('type-by-id');
    typeByIdDb.createReadStream()
      .on('data', function(data) {
        if (idsMap[data.key]) {
          results[data.key] = data.value;
        }
      }).on('end', function() {
        resolve(results);
      });
  });
};

/**
 * Get a stream of all items.
 *
 * @param  {String} projectId
 * @param  {Number} projectVersion
 * @return {Stream}
 */
LevelRepository.prototype.getStream = function (projectId, projectVersion) {
  var self = this;

  return new BBPromise(function (resolve) {
    var client = self.adapter.getClient(projectId, projectVersion);
    var itemByTypeAndIdDb = client.sublevel('item-by-type-and-id', bytewiseCodec);

    return itemByTypeAndIdDb.createReadStream()
      .pipe(map(function (data, cb) {
        cb(undefined, {
          key: data.key.split(',')[0],
          value: JSON.parse(data.value)
        });
      }));
  });
};

module.exports = LevelRepository;
