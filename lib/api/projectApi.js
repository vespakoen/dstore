module.exports = function (app) {
  return {
    publish: function (key, data) {
      return app.get('queue')
        .then(function (queue) {
          return queue.setupPublisher();
        })
        .then(function (publisher) {
          return publisher.publish('queue', {
            key: key,
            command: data || {}
          });
        });
    },

    get: function (projectId) {
      return this.publish('get-project', {
        project_id: projectId
      });
    },

    getAllVersions: function () {
      return this.publish('get-all-project-versions');
    },

    getVersion: function (projectId) {
      return this.publish('get-project-version', {
        project_id: projectId
      });
    },

    getAll: function () {
      return this.publish('get-all-projects');
    },

    put: function (projectId, blueprints) {
      return this.publish('put-project', {
        project_id: projectId,
        blueprints: blueprints
      });
    },

    putAll: function (projects) {
      return this.publish('put-all-projects', {
        projects: projects
      });
    },

    del: function (projectId) {
      return this.publish('del-project', {
        project_id: projectId
      });
    },

    delAll: function () {
      return this.publish('del-all-projects');
    },

    tag: function (projectId) {
      return this.publish('tag-project', {
        project_id: projectId
      });
    },

    tagAll: function () {
      return this.publish('tag-all-projects');
    }
  };
};
