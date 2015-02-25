'use strict';

var _ = require('underscore');
var pg = require('pg');
var help = require('../../helpers');
var BBPromise = require('bluebird');
var es = require('event-stream');
var copyTo = require('pg-copy-streams').to;
var copyFrom = require('pg-copy-streams').from;
BBPromise.promisifyAll(pg);

/**
 * PostgresqlSyncer
 * 
 * @class storage.postgresql.PostgresqlSyncer
 * 
 * @param {Object} config
 * @param {storage.postgresql.PostgresqlAdapter}  adapter
 * @param {project.blueprint.BlueprintFacade}     blueprintFacade
 * @param {storage.ItemTransformer}               itemTransformer
 */
function PostgresqlSyncer(config, adapter, blueprintFacade, itemTransformer) {
  this.config = config;
  this.adapter = adapter;
  this.blueprintFacade = blueprintFacade;
  this.itemTransformer = itemTransformer;
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
PostgresqlSyncer.attachKey = 'storage.postgresql.syncer';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {BBPromise} A PostgresqlSyncer instance with resolved dependencies
 */
PostgresqlSyncer.attach = function(app) {
  var config = app.config.postgresql;
  return BBPromise.join(
    app.get('storage.postgresql.adapter'),
    app.get('project.blueprint.facade'),
    app.get('storage.itemtransformer')
  )
  .spread(function(adapter, blueprintFacade, itemTransformer) {
    return new PostgresqlSyncer(config, adapter, blueprintFacade, itemTransformer);
  });
};

/**
 * Import data from old database to new one
 *
 * @param  {String} projectId
 * @param  {Number} projectVersion
 * @param  {Object} blueprints
 *
 * @return {BBPromise.<undefined>}
 */
PostgresqlSyncer.prototype.sync = function(projectId, projectVersion, blueprints) {
  var self = this;
  var opts = {};

  var fromConnectionString = 'postgresql://' + this.config.username + ':' + this.config.password + '@' + this.config.host + '/' + projectId + 'v' + (projectVersion - 1);
  var toConnectionString = 'postgresql://' + this.config.username + ':' + this.config.password + '@' + this.config.host + '/' + projectId + 'v' + projectVersion;

  return self._getConnection(fromConnectionString)
    .then(function (fromClient) {
      opts.fromClient = fromClient;
      return self._getConnection(toConnectionString);
    })
    .then(function (toClient) {
      opts.toClient = toClient;
      return self.blueprintFacade.getAllBlueprints(projectId, projectVersion - 1);
    })
    .then(function (fromBlueprints) {
      opts.fromBlueprints = fromBlueprints;

      var clients = _.object(_.map(blueprints, function (blueprint, blueprintId) {
        var fromBlueprint = fromBlueprints[blueprintId];
        return [
          blueprintId,
          {
            from: opts.fromClient.query(copyTo('COPY ' + fromBlueprint.postgresql.table + ' (id, project_version, ' + Object.keys(fromBlueprint.columns).join(', ') + ') TO STDOUT')),
            to: opts.toClient.query(copyFrom('COPY ' + blueprint.postgresql.table + ' (id, project_version, ' + Object.keys(blueprint.columns).join(', ') + ') FROM STDIN'))
          }
        ];
      }));

      _.each(clients, function (stream, blueprintId) {
        stream.from
          .pipe(es.through(function (data) {
            var tsv = data.toString();
            var parts = tsv.split("\n")[0].split("\t");
            var i = 2;
            var item = {id: parts[0], project_version: parts[1]};
            var fromBlueprint = fromBlueprints[blueprintId];
            Object.keys(fromBlueprint.columns)
              .forEach(function (columnKey) {
                item[columnKey] = parts[i];
                i++;
              });

            var streamSelf = this;
            streamSelf.pause();
            item.project_version = projectVersion - 1;
            return self.itemTransformer.transform(projectId, blueprintId, item, projectVersion)
              .then(function (transformedItem) {
                var newParts = [transformedItem.id, transformedItem.project_version];
                Object.keys(blueprints[blueprintId].columns)
                  .forEach(function (columnKey) {
                    newParts.push(transformedItem[columnKey] === null ? '\\N' : transformedItem[columnKey]);
                  });

                streamSelf.emit('data', newParts.join("\t"));
                streamSelf.resume();
              });
          }))
          .pipe(stream.to);
      });
    });
};

PostgresqlSyncer.prototype._getConnection = function (connectionString) {
  var self = this;
  return pg.connectAsync(connectionString)
    .spread(function(client, done) {
      self.closeConnection = done;
      return client;
    });
};

module.exports = PostgresqlSyncer;
