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
    app.get('project.facade')
  );
}).spread(function (consumer, publisher, facade) {
  consumer.consume('get-project', getProject);
  consumer.consume('get-project-version', getProjectVersion);
  consumer.consume('put-project', putProject);
  consumer.consume('get-all-projects', getAllProjects);
  consumer.consume('put-all-projects', putAllProjects);
  consumer.consume('tag-project', tagProject);
  consumer.consume('tag-all-projects', tagAllProjects);
  
  console.log('Queue to project started');

  function getProject(command) {
    console.log('get-project', command.project_id || 'no project_id');

    return facade.getProject(command.project_id);
  }

  function getProjectVersion(command) {
    console.log('get-project-version', command.project_id || 'no project_id');

    return facade.getProjectVersion(command.project_id);
  }

  function putProject(command) {
    console.log('put-project', command.project_id || 'no project_id', command.blueprints || 'no blueprints');

    return facade.putProject(command.project_id);
  };

  function getAllProjects() {
    console.log('get-all-projects');

    return facade.getAllProjects();
  };

  function putAllProjects(command) {
    console.log('put-all-projects', command.projects || 'no projects');

    return facade.putAllProjects(command.projects);
  };

  function tagProject(command) {
    console.log('tag-project', command.project_id || 'no project_id');

    return facade.tagProject(command.project_id);
  }

  function tagAllProjects(command) {
    console.log('tag-project', command.project_id || 'no project_id');
  };
});

process.on('SIGTERM', function () {
  if ( ! queue) return;
  queue.close(function () {
    console.log('Queue to blueprint stopping...');
    process.exit(0);
  });
});
