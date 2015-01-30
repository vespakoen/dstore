'use strict';

var fs = require('fs');
var BBPromise = require('bluebird');
var SchemaClient = require('./schemaClient');
BBPromise.promisifyAll(fs);

function PostgresqlSchemaClient(differ, namespace) {
  SchemaClient.call(this, differ);
  this.namespace = namespace;
}

PostgresqlSchemaClient.prototype = Object.create(SchemaClient.prototype);
PostgresqlSchemaClient.prototype.constructor = PostgresqlSchemaClient;

PostgresqlSchemaClient.attachKey = 'schema.client';

PostgresqlSchemaClient.attach = function (app) {
  return app.get('schema.differ')
    .then(function (differ) {
      return function (namespace) {
        return new PostgresqlSchemaClient(differ, namespace);
      };
    });
};

PostgresqlSchemaClient.prototype.getLog = function() {
};

PostgresqlSchemaClient.prototype.log = function(changes) {
};

PostgresqlSchemaClient.prototype.getSnapshot = function(snapshotVersion) {
};

PostgresqlSchemaClient.prototype.putSnapshot = function(snapshotVersion, snapshot) {
};

module.exports = PostgresqlSchemaClient;
