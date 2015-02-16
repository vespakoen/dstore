'use strict';

var fs = require('fs');
var _ = require('underscore');
var BBPromise = require('bluebird');

/**
 * ItemRepository
 * 
 * @class item.ItemRepository
 * 
 * @param {blueprint.BlueprintAdapter} blueprintAdapter
 * @param {item.ItemTransformer} itemTransformer
 * @param {Validator} validator
 */
function ItemRepository(blueprintAdapter, itemTransformer, validator) {
  this.blueprintAdapter = blueprintAdapter;
  this.itemTransformer = itemTransformer;
  this.validator = validator;
}

// ItemRepository.prototype.putItemForAllVersions = function (namespace, blueprintKey, item) {
//   var self = this;

//   // make a copy of the item
//   item = _.clone(item);

//   var blueprintClient = this.blueprintAdapter.getClient(namespace);

//   // returns a promise that resolves when all callback generated promises are done
//   return blueprintClient.forEveryVersionOfBlueprint(namespace, blueprintKey, item.snapshot_version, function (snapshotVersion, blueprintKeyAtVersion) {
//     // transform the item to the given snapshot version
//     return self.itemTransformer.transform(namespace, blueprintKey, item, snapshotVersion)
//       .then(function(item) {
//         return self.putItem(namespace, blueprintKeyAtVersion, item);
//       });
//   });
// };

// ItemRepository.prototype.delItemForAllVersions = function (namespace, blueprintKey, snapshotVersion, id) {
//   var self = this;

//   var blueprintClient = this.blueprintAdapter.getClient(namespace);

//   // returns a promise that resolves when all callback generated promises are done
//   return blueprintClient.forEveryVersionOfBlueprint(namespace, blueprintKey, snapshotVersion, function (snapshotVersion, blueprintKeyAtVersion) {
//     return self.delItem(namespace, blueprintKeyAtVersion, snapshotVersion, id);
//   });
// };

ItemRepository.prototype._validatePutItem = function (namespace, blueprintKey, id, item) {
  var self = this;

  return new BBPromise(function(resolve, reject) {
    if (!namespace) {
      return reject(new Error('The \'namespace\' argument is required!'));
    }
    if (!blueprintKey) {
      return reject(new Error('The \'blueprintKey\' argument is required!'));
    }
    if (!id) {
      return reject(new Error('The \'id\' argument is required!'));
    }
    if (!item) {
      return reject(new Error('The \'item\' argument is required!'));
    }

    var blueprintClient = self.blueprintAdapter.getClient(namespace);
    resolve(blueprintClient.getBlueprint(item.snapshot_version, blueprintKey)
      .then(function (blueprint) {
        var schema = self.getSchemaFromBlueprint(blueprint, blueprintKey);
        self.validator.addSchema(schema);

        var result = self.validator.validate(item, blueprintKey);
        if ( ! result.valid) {
          throw result.err;
        }

        return blueprint;
      }));
  });
};

ItemRepository.prototype._validateDelItem = function (namespace, blueprintKey, id) {
  return new BBPromise(function(resolve, reject) {
    if (!namespace) {
      return reject(new Error('The \'namespace\' argument is required!'));
    }
    if (!blueprintKey) {
      return reject(new Error('The \'blueprintKey\' argument is required!'));
    }
    if (!id) {
      return reject(new Error('The \'id\' argument is required!'));
    }
    resolve();
  });
};

ItemRepository.prototype.getSchemaFromBlueprint = function (blueprint, blueprintKey) {
  var properties = {};
  var required = [];

  _.each(blueprint.columns, function (column, columnKey) {
    var property = column.validation;
    if ( ! property) {
      property = { "$ref": "types#/definitions/" + column.type };
    } else {
      if (property.required) {
        required.push(columnKey);
      }
    }

    if (column.nullable) {
      property = {
        anyOf: [
          property,
          { "type": "null" }
        ]
      };
    }

    properties[columnKey] = property;
  });

  return {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "id": blueprintKey,
    "allOf": [
      { "$ref": "item" },
      blueprint.validation ? blueprint.validation : {
        "type": "object",
        "properties": properties,
        "required": required
      } 
    ]
  };
};

module.exports = ItemRepository;
