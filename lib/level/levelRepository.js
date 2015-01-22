'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var map = require('map-stream');
var bytewiseCodec = require('level-sublevel/codec/bytewise');
var ItemRepository = require('../item/itemRepository');

/**
 * @class level.LevelRepository
 * LevelRepository
 * 
 * @param {level.LevelSerializer} serializer
 * @param {level.LevelAdapter} adapter
 * @param {schema.SchemaAdapter} schemaAdapter
 * @param {item.ItemTransformer} itemTransformer
 */
function LevelRepository(serializer, adapter, schemaAdapter, itemTransformer) {
  ItemRepository.call(this, schemaAdapter, itemTransformer);
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
LevelRepository.attachKey = 'level.repository';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {BBPromise} A LevelRepository instance with resolved dependencies.
 */
LevelRepository.attach = function (app) {
  return BBPromise.join(
    app.get('level.serializer'),
    app.get('level.adapter'),
    app.get('schema.adapter'),
    app.get('item.transformer')
  ).spread(function (serializer, adapter, schemaAdapter, itemTransformer) {
    return new LevelRepository(serializer, adapter, schemaAdapter, itemTransformer);
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
LevelRepository.prototype.putItem = function (namespace, schemaKey, item) {
  var self = this;
  return this._validatePutItem(namespace, schemaKey, item)
    .then(function () {
       // serialize the item
      return self.serializer.serialize(namespace, schemaKey, item);
    })
    .then(function(item) {
      var value = JSON.stringify(item);

      var client = self.adapter.getClient(namespace, item.snapshot_version);
      var typeByIdDb = client.sublevel('type-by-id');
      var itemByIdDb = client.sublevel('item-by-id');
      var itemByTypeDb = client.sublevel('item-by-type');
      var table = itemByTypeDb.sublevel(schemaKey);
      var itemByTypeAndIdDb = client.sublevel('item-by-type-and-id', bytewiseCodec);

      return BBPromise.promisify(typeByIdDb.put)(item.id, schemaKey)
        .then(function () {
          return BBPromise.promisify(itemByIdDb.put)(item.id, value);
        })
        .then(function () {
          return BBPromise.promisify(table.put)(item.id, value);
        })
        .then(function () {
          return BBPromise.promisify(itemByTypeAndIdDb.put)([schemaKey, item.id], value);
        })
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
LevelRepository.prototype.delItem = function (namespace, schemaKey, snapshotVersion, id) {
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

/**
 * Get a id => type map.
 *
 * @param  {String} namespace
 * @param  {Number} snapshotVersion
 * @param  {Array} ids
 * @return {BBPromise}
 */
LevelRepository.prototype.getIdToTypeMap = function(namespace, snapshotVersion, ids) {
  var self = this;

  return new BBPromise(function(resolve) {
    var i,
        idsMap = {},
        results = {};

    ids.forEach(function (id) {
      idsMap[id] = true;
    });
    
    var client = self.adapter.getClient(namespace, snapshotVersion);
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
 * @param  {String} namespace
 * @param  {Number} snapshotVersion
 * @return {Stream}
 */
LevelRepository.prototype.getStream = function (namespace, snapshotVersion) {
  var self = this;

  return new BBPromise(function (resolve) {
    var client = self.adapter.getClient(namespace, snapshotVersion);
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
