'use strict';

var _ = require('underscore');

/**
 * ItemTransformer
 * 
 * @class item.ItemTransformer
 * 
 * @param {blueprint.BlueprintAdapter} blueprintAdapter
 */
function ItemTransformer(blueprintAdapter) {
  this.blueprintAdapter = blueprintAdapter;
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
ItemTransformer.attachKey = 'item.transformer';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {BBPromise} An ItemTransformer instance with resolved dependencies.
 */
ItemTransformer.attach = function (app) {
  return app.get('blueprint.adapter')
    .then(function (blueprintAdapter) {
      return new ItemTransformer(blueprintAdapter);
    });
};

ItemTransformer.prototype.transform = function(projectId, blueprintId, item, snapshotVersion) {
  var self = this;
  item = _.clone(item);
  var blueprintClient = this.blueprintAdapter.getClient(projectId);
  return blueprintClient.getChangesBetween(item.snapshot_version, snapshotVersion)
    .then(function(changes) {
      return self._applyChanges(changes, blueprintId, item);
    });
};

ItemTransformer.prototype._applyChanges = function(changes, blueprintId, item) {
  _.each(changes, function(change) {
    if (change.blueprint !== blueprintId) {
      return;
    }

    switch (change.type) {
      case 'snapshot.create':
        item.snapshot_version = change.value;
        break;
      case 'blueprint.rename':
        blueprintId = change.value;
        break;
      case 'column.create':
        item[change.column] = undefined;
        break;
      case 'column.rename':
        item[change.value] = item[change.column];
        delete item[change.column];
        break;
      case 'column.update':
        if (change.key === 'type') {
          item[change.column] = this._transformTypeOfItem(item[change.column], change.oldValue, change.value);
        }
        break;
      case 'column.remove':
        delete item[change.column];
        break;
    }
  }, this);

  return {
    blueprintId: blueprintId,
    item: item
  };
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
