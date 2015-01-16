'use strict';

var SchemaClient = require('./schemaClient');

/**
 * @class schema.SchemaAdapter
 * SchemaAdapter
 * @param {schema.schemaClient} clientFactory
 */
function SchemaAdapter(clientFactory) {
  this.connections = {};
  this.clientFactory = clientFactory;
}

SchemaAdapter.attachKey = 'schema.adapter';

SchemaAdapter.attach = function(app) {
  return app.get('schema.client').then(function (clientFactory) {
    return new SchemaAdapter(clientFactory);
  });
};

SchemaAdapter.prototype.getClient = function(namespace) {
  if (!this.connections[namespace]) {
    this.connections[namespace] = this.clientFactory(namespace);
  }
  return this.connections[namespace];
};

module.exports = SchemaAdapter;
