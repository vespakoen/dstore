'use strict';

var _ = require('underscore');

/**
 * ItemTransformer
 * 
 * @class storage.ItemTransformer
 * 
 * @param {project.blueprint.BlueprintService} blueprintService
 */
function ItemTransformer(blueprintService) {
  this.blueprintService = blueprintService;
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
ItemTransformer.attachKey = 'storage.itemtransformer';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {BBPromise} An ItemTransformer instance with resolved dependencies.
 */
ItemTransformer.attach = function (app) {
  return app.get('project.blueprint.service')
    .then(function (blueprintService) {
      return new ItemTransformer(blueprintService);
    });
};

ItemTransformer.prototype.transform = function(projectId, blueprintId, item, projectVersion) {
  var self = this;
  item = _.clone(item);
  return this.blueprintService.getChangesBetween(projectId, item.project_version, projectVersion)
    .then(function(changes) {
      return self._applyChanges(changes, blueprintId, item);
    });
};

ItemTransformer.prototype._applyChanges = function(changes, blueprintId, item) {
  _.each(changes, function(change) {
    if (change.blueprint !== blueprintId && change.type !== 'project.tag') {
      return;
    }

    switch (change.type) {
      case 'project.tag':
        item.project_version = change.value;
        break;
      case 'column.create':
        item[change.column] = null;
        break;
      case 'column.rename':
        item[change.value] = item[change.column];
        delete item[change.column];
        break;
      case 'column.update':
        if (change.key === 'type') {
          item[change.column] = null; //this._transformTypeOfItem(item[change.column], change.oldValue, change.value);
        }
        break;
      case 'column.remove':
        delete item[change.column];
        break;
    }
  }, this);
  
  return item;
};

ItemTransformer.prototype._transformTypeOfItem = function(value, fromType, toType) {
  // stringify if possible
  if (toType === 'string') {
    if (value === null) {
      return null;
    }

    if (_.isDate(value)) {
      return value.toString();
    }

    if (_.isObject(value) || _.isArray(value)) {
      return JSON.stringify(value);
    }

    return "" + value;
  }

  return null;
};

module.exports = ItemTransformer;
