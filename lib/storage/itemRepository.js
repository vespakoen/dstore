'use strict';

var fs = require('fs');
var _ = require('underscore');
var BBPromise = require('bluebird');

/**
 * ItemRepository
 * 
 * @class storage.ItemRepository
 * 
 * @param {project.blueprint.BlueprintFacade}  blueprintFacade
 * @param {item.ItemTransformer}                itemTransformer
 * @param {Validator}                           validator
 */
function ItemRepository(blueprintFacade, itemTransformer, validator) {
  this.blueprintFacade = blueprintFacade;
  this.itemTransformer = itemTransformer;
  this.validator = validator;
}

ItemRepository.prototype.putItemForAllVersions = function (projectId, blueprintId, id, item) {
  var self = this;

  // make a copy of the item
  item = _.clone(item);

  // returns a promise that resolves when all callback generated promises are done
  return this.blueprintFacade.forEveryBlueprintVersion(projectId, blueprintId, function (projectVersion) {
    // transform the item to the given snapshot version
    return self.itemTransformer.transform(projectId, blueprintId, item, projectVersion)
      .then(function(item) {
        return self.putItem(projectId, blueprintId, id, item);
      });
  });
};

ItemRepository.prototype.delItemForAllVersions = function (projectId, blueprintId, id) {
  var self = this;

  // returns a promise that resolves when all callback generated promises are done
  return this.blueprintFacade.forEveryBlueprintVersion(projectId, blueprintId, function (projectVersion) {
    return self.delItem(projectId, blueprintId, id, projectVersion);
  });
};

ItemRepository.prototype._validatePutItem = function (projectId, blueprintId, id, item) {
  var self = this;

  return new BBPromise(function(resolve, reject) {
    if (!projectId) {
      return reject(new Error('The \'projectId\' argument is required!'));
    }
    if (!blueprintId) {
      return reject(new Error('The \'blueprintId\' argument is required!'));
    }
    if (!id) {
      return reject(new Error('The \'id\' argument is required!'));
    }
    if (!item) {
      return reject(new Error('The \'item\' argument is required!'));
    }

    resolve(self.blueprintFacade.getBlueprint(projectId, blueprintId, item.project_version)
      .then(function (blueprint) {
        var schema = self.getSchemaFromBlueprint(blueprint, blueprintId);
        self.validator.addSchema(schema);

        var result = self.validator.validate(item, blueprintId);
        if ( ! result.valid) {
          throw result.err;
        }

        return blueprint;
      }));
  });
};

ItemRepository.prototype._validateDelItem = function (projectId, blueprintId, id) {
  return new BBPromise(function(resolve, reject) {
    if (!projectId) {
      return reject(new Error('The \'projectId\' argument is required!'));
    }
    if (!blueprintId) {
      return reject(new Error('The \'blueprintId\' argument is required!'));
    }
    if (!id) {
      return reject(new Error('The \'id\' argument is required!'));
    }
    resolve();
  });
};

ItemRepository.prototype.getSchemaFromBlueprint = function (blueprint, blueprintId) {
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
    "id": blueprintId,
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
