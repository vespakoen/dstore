'use strict';

var _ = require('underscore');
var pg = require('pg');
var help = require('../../helpers');
var BBPromise = require('bluebird');
BBPromise.promisifyAll(pg);

/**
 * PostgresqlDropper
 * 
 * @class storage.postgresql.PostgresqlDropper
 * 
 * @param {Object} config
 */
function PostgresqlDropper(config) {
  this.config = config;
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
PostgresqlDropper.attachKey = 'storage.postgresql.dropper';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {BBPromise} A PostgresqlDropper instance with resolved dependencies
 */
PostgresqlDropper.attach = function(app) {
  var config = app.config.postgresql;
  return BBPromise.resolve(new PostgresqlDropper(config));
};

/**
 * Create / migrate database.
 *
 * @param  {String} projectId
 * @param  {Number} projectVersion
 *
 * @return {BBPromise.<undefined>}
 */
PostgresqlDropper.prototype.drop = function(projectId) {
  var self = this;
  var opts = {
    projectId: projectId,
    projectVersion: projectVersion,
    connectionString: 'postgresql://' + this.config.username + ':' + this.config.password + '@' + this.config.host + '/postgres',
    blueprints: blueprints
  };

  return self._getConnection(opts)
    .then(function (client) {
      opts.client = client;
      return self.projectService.getProjectVersion(projectId);
    })
    .then(function (projectVersion) {
      if (_.isNumber(projectVersion) {
        var versions = _.range(1, projectVersion);
        return BBPromise.all(_.map(versions, function (version) {
          return opts.client.queryAsync("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'blueprintservicetestv" + projectVersion + "'")
            .then(function () {
              return opts.client.queryAsync('DROP DATABASE blueprintservicetestv' + projectVersion);
            });
        }));
      }
    });
};

PostgresqlDropper.prototype._getConnection = function (opts) {
  var self = this;
  return pg.connectAsync(opts.connectionString)
    .spread(function(client, done) {
      self.connectionCloser = done;
      return client;
    });
};

PostgresqlDropper.prototype.closeConnection = function () {
  if (this.connectionCloser) {
    this.connectionCloser();
  }
};

module.exports = PostgresqlDropper;


