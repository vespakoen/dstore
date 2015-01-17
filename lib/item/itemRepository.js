'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');;
var validator = require('validator');

/**
 * @class item.ItemRepository
 * ItemRepository
 * 
 * @param {schema.SchemaAdapter} schemaAdapter
 * @param {item.ItemTransformer} itemTransformer
 */
function ItemRepository(schemaAdapter, itemTransformer) {
  this.schemaAdapter = schemaAdapter;
  this.itemTransformer = itemTransformer;
}

ItemRepository.prototype.putItemForAllVersions = function (namespace, schemaKey, item) {
  var self = this;

  // make a copy of the item
  item = _.clone(item);

  var schemaClient = this.schemaAdapter.getClient(namespace);

  // returns a promise that resolves when all callback generated promises are done
  return schemaClient.forEveryVersionOfSchema(namespace, schemaKey, item.version, function (version, schemaKeyAtVersion) {
    // transform the item to the given version
    return self.itemTransformer.transform(namespace, schemaKey, item, version)
      .then(function(item) {
        return self.putItem(namespace, schemaKeyAtVersion, item);
      });
  });
};

ItemRepository.prototype.delItemForAllVersions = function (namespace, schemaKey, version, id) {
  var self = this;

  var schemaClient = this.schemaAdapter.getClient(namespace);

  // returns a promise that resolves when all callback generated promises are done
  return schemaClient.forEveryVersionOfSchema(namespace, schemaKey, version, function (version, schemaKeyAtVersion) {
    return self.delItem(namespace, schemaKeyAtVersion, version, id);
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
    if (!item.id) {
      return reject(new Error('The \'item\' requires the \'id\' key to be present!'));
    }
    if (!item.version) {
      return reject(new Error('The \'item\' requires the \'version\' key to be present!'));
    }

    var schemaClient = self.schemaAdapter.getClient(namespace);
    resolve(schemaClient.getSnapshot(item.version)
      .then(function (snapshot) {
        var schema = snapshot[schemaKey];
        if (!schema) {
          throw new Error('Schema \'' + schemaKey + '\' does not exist for version \'' + item.version + '\'');
        }

        var errors = [];
        _.each(schema.columns, function (column, columnKey) {
          if (column.rules) {
            _.each(column.rules, function (rule) {
              /*
              calls validation method on the validator object
              see https://github.com/chriso/validator.js

              examples ('rule' -> 'actual call that is made'):
              {type: 'isEmail'}                 -> validator.isEmail(item[columnKey]);
              {type: 'isLength', args: [0, 3]}  -> validator.isLength(item[columnKey], 0, 3);
               */
              var isValid = validator[rule.type].apply(validator, [item[columnKey]].concat(rule.args || []));
              if ( ! isValid) {
                errors.push({
                  key: columnKey,
                  type: rule.type,
                  args: rule.args || [],
                  message: columnKey + '\'s value did not pass the ' + rule.type + ' check' + (rule.args ? ' with arguments ' + rule.args.join(', ') : '')
                });
              }
            });
          }
        });

        if (errors.length > 0) {
          var error = new Error('Errors while validating item');
          error.errors = errors;
          throw error;
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

module.exports = ItemRepository;
