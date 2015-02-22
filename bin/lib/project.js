'use strict';

var app = require('../../main');
var BBPromise = require('bluebird');

module.exports = function () {
  return app.get('queue')
    .then(function (queue) {
      return BBPromise.join(
        queue.setupConsumer(),
        app.get('project.facade')
      );
    })
    .spread(function (consumer, facade) {
      consumer.consume('get-project', getProject);
      consumer.consume('get-project-version', getProjectVersion);
      consumer.consume('get-all-projects', getAllProjects);
      consumer.consume('put-project', putProject);
      consumer.consume('put-all-projects', putAllProjects);
      consumer.consume('del-project', delProject);
      consumer.consume('del-all-projects', delAllProjects);
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

      function getAllProjects() {
        console.log('get-all-projects');

        return facade.getAllProjects();
      }

      function putProject(command) {
        console.log('put-project', command.project_id || 'no project_id', command.blueprints ? '' : 'no blueprints');

        return facade.putProject(command.project_id, command.blueprints);
      }

      function putAllProjects(command) {
        console.log('put-all-projects', command.projects || 'no projects');

        return facade.putAllProjects(command.projects);
      }

      function delProject(command) {
        console.log('del-project', command.project_id || 'no project_id');

        return facade.delProject(command.project_id);
      }

      function delAllProjects() {
        console.log('del-all-projects');

        return facade.delAllProjects();
      }

      function tagProject(command) {
        console.log('tag-project', command.project_id || 'no project_id');

        return facade.tagProject(command.project_id);
      }

      function tagAllProjects(command) {
        console.log('tag-all-projects');
        return facade.tagAllProjects();
      }
    });
};
