'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');;
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

LevelRepository.attachKey = 'level.repository';

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

LevelRepository.prototype.putItem = function (namespace, schemaKey, item) {
  var self = this;

  return this._validatePutItem(namespace, schemaKey, item)
    .then(function () {
       // serialize the item
      return self.serializer.serialize(namespace, schemaKey, item);
    })
    .then(function(item) {
      var value = JSON.stringify(item);

      var client = self.adapter.getClient(namespace, item.version);
      var typeByIdDb = client.sublevel('type-by-id');
      var itemByIdDb = client.sublevel('item-by-id');
      var itemByTypeDb = client.sublevel('item-by-type');
      var table = itemByTypeDb.sublevel(schemaKey);
      var itemByTypeAndIdDb = client.sublevel('item-by-type-and-id', bytewiseCodec);

      return BBPromise.join(
        BBPromise.promisify(typeByIdDb.put)(item.id, schemaKey),
        BBPromise.promisify(itemByIdDb.put)(item.id, value),
        BBPromise.promisify(table.put)(item.id, value),
        BBPromise.promisify(itemByTypeAndIdDb.put)([schemaKey, item.id], value)
      )
      .catch(function (err) {
        console.error('leveldb error', err);
      });
    });
};

LevelRepository.prototype.delItem = function (namespace, schemaKey, version, id) {
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

/**
 * Get a id => type map.
 *
 * @param  {String} namespace
 * @param  {Number} version
 * @param  {Array} ids
 * @return {Promise}
 */
LevelRepository.prototype.getIdToTypeMap = function(namespace, version, ids) {
  var self = this;

  return new BBPromise(function(resolve) {
    var i,
        idsMap = {},
        results = {};

    for (i in ids) {
      idsMap[ids[i]] = true;
    }

    var client = self.adapter.getClient(namespace, version);
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
 * @param  {Number} version
 * @return {Stream}
 */
LevelRepository.prototype.getStream = function (namespace, version) {
  var self = this;

  return new BBPromise(function (resolve) {
    var client = self.adapter.getClient(namespace, version);
    var itemByTypeAndIdDb = client.sublevel('item-by-type-and-id', bytewiseCodec);

    return itemByTypeAndIdDb.createReadStream()
      .pipe(map(function (data, cb) {
        cb(null, {
          key: data.key.split(',')[0],
          value: JSON.parse(data.value)
        });
      }));
  });
};

module.exports = LevelRepository;
