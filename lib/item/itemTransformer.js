'use strict';

var _ = require('underscore');

function ItemTransformer(schemaAdapter) {
  this.schemaAdapter = schemaAdapter;
}

ItemTransformer.attachKey = 'item.transformer';

ItemTransformer.attach = function (app) {
  return app.get('schema.adapter')
    .then(function (schemaAdapter) {
      return new ItemTransformer(schemaAdapter);
    });
};

ItemTransformer.prototype.transform = function(namespace, schemaKey, item, version) {
  var self = this;
  item = _.clone(item);
  var schemaClient = this.schemaAdapter.getClient(namespace);
  return schemaClient.getChangesBetween(item.version, version).then(function(changes) {
    return self._applyChanges(changes, schemaKey, item);
  });
};

ItemTransformer.prototype._applyChanges = function(changes, schemaKey, item) {
  _.each(changes, function(change) {
    if (change.schema !== schemaKey) {
      return;
    }

    switch (change.type) {
      case 'snapshot.create':
        item.version = change.value;
        break;
      case 'schema.rename':
        schemaKey = change.value;
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
          item[change.column] = this._transformTypeOfItem(item[change.column], change.oldValue, change.value);
        }
        break;
      case 'column.remove':
        delete item[change.column];
        break;
    }
  }, this);

  return {
    schemaKey: schemaKey,
    item: item
  };
};

ItemTransformer.prototype._transformTypeOfItem = function(value, fromType, toType) {
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
  return value;
};

module.exports = ItemTransformer;
