'use strict';

var BBPromise = require('bluebird');
var app = require('../../main');

module.exports = function () {
  return BBPromise.join(
    app.get('queue')
      .then(function (queue) {
        return queue.setupConsumer();
      }),
    app.get('project.blueprint.facade')
  )
  .spread(function (consumer, facade) {
    consumer.consume('get-blueprint', getBlueprint);
    consumer.consume('get-all-blueprints', getAllBlueprints);
    consumer.consume('get-blueprint-versions', getBlueprintVersions);
    consumer.consume('put-blueprint', putBlueprint);
    consumer.consume('put-all-blueprints', putAllBlueprints);

    function getBlueprint(command) {
      console.log('get-blueprint', command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id', command.project_version || 'no project_version');

      return facade.getBlueprint(command.project_id, command.blueprint_id, command.project_version);
    }

    function getAllBlueprints(command) {
      console.log('get-all-blueprint', command.project_id || 'no project_id', command.project_version || 'no project_version');

      return facade.getAllBlueprints(command.project_id, command.project_version);
    }

    function getBlueprintVersions(command) {
      console.log('get-blueprint', command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id');

      return facade.getBlueprintVersions(command.project_id, command.blueprint_id);
    }

    function putBlueprint(command) {
      console.log('put-blueprint', command.project_id || 'no project_id', command.blueprint_id || 'no blueprint_id');

      return facade.putBlueprint(command.project_id, command.blueprint_id, command.blueprint);
    }

    function putAllBlueprints(command) {
      console.log('put-blueprint', command.project_id || 'no project_id', command.blueprints || 'no blueprints');

      return facade.putBlueprint(command.project_id, command.blueprints);
    }
  });
};
