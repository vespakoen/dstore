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

SchemaService.prototype.getLog = function(namespace) {
  var client = this.adapter.getClient(namespace);
  return client.getLog();
};

SchemaService.prototype.log = function(namespace, changes) {
  var client = this.adapter.getClient(namespace);
  return client.log(changes);
};

SchemaService.prototype.getSchema = function(namespace, schemaKey, snapshotVersion) {
  var client = this.adapter.getClient(namespace);

  return client.getSchema(snapshotVersion || 'current', schemaKey);
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
      return client.getSchema('current', schemaKey)
        .catch(function () {
          // not found, return null
          return null;
        });
    })
    .then(function (from) {
      return self.differ.diff(schemaKey, from, schema);
    })
    .then(function (changes) {
      opts.changes = changes;
      return self._logChanges(opts);
    })
    .then(function() {
      return self._storeSchema(opts);
    })
    .then(function() {
      return self.getSchema(namespace, schemaKey);
    });
};

SchemaService.prototype.getSnapshotVersions = function() {
  var client = this.adapter.getClient();
  return client.getSnapshotVersions()
    .then(function (snapshotVersions) {
      return snapshotVersions || {};
    });
};

SchemaService.prototype.putSnapshotVersions = function(snapshotVersions) {
  var client = this.adapter.getClient();
  return client.putSnapshotVersions(snapshotVersions);
};

SchemaService.prototype.getSnapshot = function(namespace, snapshotVersion) {
  var client = this.adapter.getClient(namespace);
  return client.getSnapshot(snapshotVersion)
    .then(function (snapshot) {
      return snapshot || {}
    });
};

SchemaService.prototype.putSnapshot = function(namespace, snapshotVersion) {
  var client = this.adapter.getClient(namespace);
  return client.putSnapshot(snapshotVersion);
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
    if ( ! result.valid) {
      return reject(result.err);
    }

    resolve();
  });
};

SchemaService.prototype._logChanges = function(opts) {
  if (opts.changes) {
    return opts.client.log(opts.changes);
  }
};

SchemaService.prototype._storeSchema = function(opts) {
  var self = this;

  if (opts.changes.length > 0) {
    return opts.client.putSchema('current', opts.schemaKey, self.differ.getRenamedSchema(opts.schema))
      .then(function() {
        var rename = _.findWhere(opts.changes, {type: 'schema.rename'});
        if (rename) {
          return opts.client.putSchema('current', rename.value, self.differ.getRenamedSchema(opts.schema));
        }
      });
  }
};

module.exports = SchemaService;
