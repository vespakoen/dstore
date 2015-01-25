'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');

function SchemaService(adapter, differ, validator) {
  this.adapter = adapter;
  this.differ = differ;
  this.validator = validator;
}

SchemaService.attachKey = 'schema.service';

SchemaService.attach = function(app) {
  return BBPromise.join(
    app.get('schema.adapter'),
    app.get('schema.differ'),
    app.get('validator')
  ).spread(function (adapter, differ, validator) {
    return new SchemaService(adapter, differ, validator);
  });
};

SchemaService.prototype.getSchema = function(namespace, schemaKey) {
  var client = this.adapter.getClient(namespace);

  return client.getCurrentVersionOfSchema(schemaKey)
    .then(function (currentVersion) {
      return client.getSchema(schemaKey, currentVersion);
    });
};

SchemaService.prototype.getAllSchemas = function(namespace) {
  var client = this.adapter.getClient(namespace);

  return client.getSnapshot('current');
};

SchemaService.prototype.putSchema = function(namespace, schemaKey, schema) {
  var self = this;
  var opts = {
    namespace: namespace,
    schemaKey: schemaKey,
    schema: schema
  };

  return this._validatePutSchema(namespace, schemaKey, schema)
    .then(function () {
      var client = self.adapter.getClient(namespace);
      opts.client = client;
      return client.getCurrentVersionOfSchema(schemaKey);
    })
    .then(function (schemaVersion) {
      opts.schemaVersion = schemaVersion;
      return self._diffSchemaWithCurrent(opts);
    })
    .then(function (changes) {
      opts.changes = changes;
      return self._logChanges(opts);
    })
    .then(function() {
      return self._storeSchema(opts);
    })
    .then(function() {
      return self._updateSnapshot(opts);
    })
    .then(function() {
      return self.getSchema(namespace, schemaKey);
    });
};

SchemaService.prototype.putAllSchemas = function(namespace, schemas) {
  var self = this;
  var chain = BBPromise.resolve();

  return BBPromise.all(_.map(schemas, function (schema, schemaKey) {
    return BBPromise.join(
      schemaKey,
      self.putSchema(namespace, schemaKey, schema)
    );
  })).then(function (schemas) {
    return _.object(schemas);
  });
};

SchemaService.prototype._validatePutSchema = function(namespace, schemaKey, schema) {
  var self = this;

  return new BBPromise(function (resolve, reject) {
    if (!namespace) {
      return reject(new Error('The \'namespace\' argument is required!'));
    }
    if (!schemaKey) {
      return reject(new Error('The \'schemaKey\' argument is required!'));
    }
    if (!schema) {
      return reject(new Error('The \'schema\' argument is required!'));
    }

    var result = self.validator.validate(schema, 'schema');
    if ( ! result.valid) {;
      return reject(result.err);
    }

    resolve();
  });
};

SchemaService.prototype._diffSchemaWithCurrent = function(opts) {
  var self = this;
  return opts.client.getSchema(opts.schemaKey, opts.schemaVersion).then(function(from) {
    return self.differ.diff(opts.schemaKey, from, opts.schema);
  });
};

SchemaService.prototype._logChanges = function(opts) {
  if (opts.changes) {
    return opts.client.log(opts.changes);
  }
};

SchemaService.prototype._storeSchema = function(opts) {
  var self = this;

  if (opts.changes.length > 0 || opts.schemaVersion === 0) {
    opts.schemaVersion++;
    return opts.client.putSchema(opts.schemaKey, opts.schemaVersion, self.differ.getRenamedSchema(opts.schema)).then(function() {
      return opts.client.bumpCurrentVersionOfSchema(opts.schemaKey);
    }).then(function() {
      var rename = _.findWhere(opts.changes, {type: 'schema.rename'});
      if (rename) {
        return opts.client.putSchema(rename.value, 1, self.differ.getRenamedSchema(opts.schema)).then(function() {
          return opts.client.bumpCurrentVersionOfSchema(rename.value);
        });
      }
    });
  }
};

SchemaService.prototype._updateSnapshot = function(opts) {
  var self = this;

  return opts.client.getSnapshot('current')
    .then(function (currentSnapshot) {
      currentSnapshot = currentSnapshot || {};
      var renamedSchema = self.differ.getRenamedSchema(opts.schema);
      currentSnapshot[opts.schemaKey] = renamedSchema;
      return opts.client.putSnapshot('current', currentSnapshot);
    });
};

module.exports = SchemaService;
