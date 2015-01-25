'use strict';

var fs = require('fs');
var _ = require('underscore');
var BBPromise = require('bluebird');

/**
 * ItemRepository
 * 
 * @class item.ItemRepository
 * 
 * @param {schema.SchemaAdapter} schemaAdapter
 * @param {item.ItemTransformer} itemTransformer
 * @param {Validator} validator
 */
function ItemRepository(schemaAdapter, itemTransformer, validator) {
  this.schemaAdapter = schemaAdapter;
  this.itemTransformer = itemTransformer;
  this.validator = validator;
}

ItemRepository.prototype.putItemForAllVersions = function (namespace, schemaKey, item) {
  var self = this;

  // make a copy of the item
  item = _.clone(item);

  var schemaClient = this.schemaAdapter.getClient(namespace);

  // returns a promise that resolves when all callback generated promises are done
  return schemaClient.forEveryVersionOfSchema(namespace, schemaKey, item.snapshot_version, function (snapshotVersion, schemaKeyAtVersion) {
    // transform the item to the given snapshot version
    return self.itemTransformer.transform(namespace, schemaKey, item, snapshotVersion)
      .then(function(item) {
        return self.putItem(namespace, schemaKeyAtVersion, item);
      });
  });
};

ItemRepository.prototype.delItemForAllVersions = function (namespace, schemaKey, snapshotVersion, id) {
  var self = this;

  var schemaClient = this.schemaAdapter.getClient(namespace);

  // returns a promise that resolves when all callback generated promises are done
  return schemaClient.forEveryVersionOfSchema(namespace, schemaKey, snapshotVersion, function (snapshotVersion, schemaKeyAtVersion) {
    return self.delItem(namespace, schemaKeyAtVersion, snapshotVersion, id);
  });
};

ItemRepository.prototype._validatePutItem = function (namespace, schemaKey, item) {
  var self = this;

  return new BBPromise(function(resolve, reject) {
    if (!namespace) {
      return reject(new Error('The \'namespace\' argument is required!'));
    }
    if (!schemaKey) {
      return reject(new Error('The \'schemaKey\' argument is required!'));
    }
    if (!item) {
      return reject(new Error('The \'item\' argument is required!'));
    }

    var schemaClient = self.schemaAdapter.getClient(namespace);
    resolve(schemaClient.getSnapshot(item.snapshot_version)
      .then(function (snapshot) {
        var schema = snapshot[schemaKey];
        if (!schema) {
          throw new Error('Schema \'' + schemaKey + '\' does not exist for version \'' + item.snapshot_version + '\'');
        }

        var jsonSchema = self.getJsonSchemaFromProjectorSchema(schema, schemaKey);
        self.validator.addSchema(jsonSchema);

        var result = self.validator.validate(item, schemaKey);
        if ( ! result.valid) {
          throw result.err;
        }

        return schema;
      }));
  });
};

ItemRepository.prototype._validateDelItem = function (namespace, schemaKey, id) {
  return new BBPromise(function(resolve, reject) {
    if (!namespace) {
      return reject(new Error('The \'namespace\' argument is required!'));
    }
    if (!schemaKey) {
      return reject(new Error('The \'schemaKey\' argument is required!'));
    }
    if (!id) {
      return reject(new Error('The \'id\' argument is required!'));
    }
    resolve();
  });
};

ItemRepository.prototype.getJsonSchemaFromProjectorSchema = function (schema, schemaKey) {
  var properties = {};
  var required = [];

  _.each(schema.columns, function (column, columnKey) {
    var property = column.validation;
    if ( ! property) {
      property = { "$ref": "types#/definitions/" + column.type };
    } else {
      if (property.required) {
        required.push(columnKey);
      }
    }
    properties[columnKey] = property;
  });

  return {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "id": schemaKey,
    "allOf": [
      { "$ref": "item" },
      {
        "type": "object",
        "properties": properties,
        "required": required
      } 
    ]
  };
};

module.exports = ItemRepository;
