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
            command: data
          });
        });
    },

    get: function (projectId, blueprintId, projectVersion) {
      return this.publish('get-blueprint', {
        project_id: projectId,
        blueprint_id: blueprintId,
        project_version: projectVersion
      });
    },

    getAll: function (projectId, projectVersion) {
      return this.publish('get-all-blueprints', {
        project_id: projectId,
        project_version: projectVersion
      });
    },

    getVersions: function (projectId, blueprintId) {
      return this.publish('get-blueprint-versions', {
        project_id: projectId,
        blueprint_id: blueprintId
      });
    },

    put: function (projectId, blueprintId, blueprint) {
      return this.publish('put-blueprint', {
        project_id: projectId,
        blueprint_id: blueprintId,
        blueprint: blueprint
      });
    },

    putMany: function (projectId, blueprints) {
      return this.publish('put-many-blueprints', {
        project_id: projectId,
        blueprints: blueprints
      });
    }
  };
};
