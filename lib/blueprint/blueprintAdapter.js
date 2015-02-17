'use strict';

var BlueprintClient = require('./blueprintClient');

/**
 * @class blueprint.BlueprintAdapter
 * BlueprintAdapter
 * @param {blueprint.blueprintClient} clientFactory
 */
function BlueprintAdapter(clientFactory) {
  this.connections = {};
  this.clientFactory = clientFactory;
}

BlueprintAdapter.attachKey = 'blueprint.adapter';

BlueprintAdapter.attach = function(app) {
  return app.get('blueprint.client').then(function (clientFactory) {
    return new BlueprintAdapter(clientFactory);
  });
};

BlueprintAdapter.prototype.getClient = function(projectId) {
  if (!this.connections[projectId]) {
    this.connections[projectId] = this.clientFactory(projectId);
  }
  return this.connections[projectId];
};

module.exports = BlueprintAdapter;
