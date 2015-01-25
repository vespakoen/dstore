var tv4 = require('tv4');
var _ = require('underscore');

function Validator(schemas) {
  this.schemas = [];
  _.each(schemas, this.addSchema, this);
}

Validator.prototype.addSchema = function (schema) {
  this.schemas.push(schema);
  tv4.addSchema(schema.id, schema);
};

Validator.prototype.validate = function (data, schemaId) {
  var schema = _.first(_.where(this.schemas, {id: schemaId}));
  if ( ! schema) {
    throw new Error('Schema "' + schemaId + '" not found!');
  }
  
  var result = tv4.validateMultiple(data, schema);
  
  if ( ! result.valid) {
    var err = new Error('Error while validating ' + schemaId);
    err.errors = _.map(result.errors, function (err) { return err.message + ' at path ' + err.dataPath; });
    return {
      valid: false,
      err: err
    };
  }

  return { valid: true };
};

Validator.attachKey = 'validator';

Validator.attach = function (app) {
  return new Validator(app.schemas);
};

module.exports = Validator;
