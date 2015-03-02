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

    get: function (projectId, blueprintId, projectVersion, id) {
      return this.publish('get-item', {
        project_id: projectId,
        blueprint_id: blueprintId,
        project_version: projectVersion,
        id: id
      });
    },

    put: function (projectId, blueprintId, id, item) {
      return this.publish('put-item', {
        project_id: projectId,
        blueprint_id: blueprintId,
        id: id,
        item: item
      });
    },

    putForSingleVersion: function (projectId, blueprintId, id, item) {
      return this.publish('put-item-for-single-version', {
        project_id: projectId,
        blueprint_id: blueprintId,
        id: id,
        item: item
      });
    },

    del: function (projectId, blueprintId, id) {
      return this.publish('del-item', {
        project_id: projectId,
        blueprint_id: blueprintId,
        id: id
      });
    }
  };
};
