'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var ItemSerializer = require('../itemSerializer');

/**
 * LevelSerializer
 *
 * @class storage.level.LevelSerializer
 * @extends {storage.ItemSerializer}
 * 
 * @param {project.blueprint.BlueprintService} blueprintService
 */
function LevelSerializer(blueprintService) {
  ItemSerializer.call(this, blueprintService);
}

LevelSerializer.prototype = Object.create(ItemSerializer.prototype);
LevelSerializer.prototype.constructor = LevelSerializer;

/**
 * IOC attachKey.
 *
 * @type {String}
 */
LevelSerializer.attachKey = 'storage.level.serializer';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {BBPromise|Object} A LevelSerializer instance with resolved dependencies.
 */
LevelSerializer.attach = function(app) {
  return app.get('project.blueprint.service')
    .then(function(blueprintService) {
      return new LevelSerializer(blueprintService);
    });
};

LevelSerializer.prototype = Object.create(ItemSerializer.prototype);
LevelSerializer.prototype.constructor = LevelSerializer;

/**
 * Serialize item for leveldb
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {Object} item
 *
 * @return {Object} The serialized item
 */
LevelSerializer.prototype.serialize = function(projectId, blueprintId, item) {
  return this._serializeItem(projectId, blueprintId, item);
};

module.exports = LevelSerializer;
