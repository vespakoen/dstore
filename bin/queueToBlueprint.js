'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var app = require('../main');

var queue;

app.get('queue').then(function (q) {
  queue = q;
  return BBPromise.join(
    q.setupConsumer(),
    q.setupPublisher(),
    app.get('project.blueprint.facade')
  );
}).spread(function (consumer, publisher, facade) {
  consumer.consume('get-blueprint', getBlueprint);
  consumer.consume('get-all-blueprints', getAllBlueprints);
  consumer.consume('get-blueprint-versions', getBlueprintVersions);
  consumer.consume('put-blueprint', putBlueprint);
  consumer.consume('put-all-blueprints', putAllBlueprints);

  console.log('Queue to blueprint started');

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

process.on('SIGTERM', function () {
  if ( ! queue) return;
  queue.close(function () {
    console.log('Queue to blueprint stopping...');
    process.exit(0);
  });
});
