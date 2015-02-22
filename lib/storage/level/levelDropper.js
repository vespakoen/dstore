'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var rmRF = BBPromise.promisify(require('rimraf'));

/**
 * LevelDropper
 * 
 * @class storage.postgresql.LevelDropper
 * 
 * @param {String} path
 * @param {project.service} projectService
 */
function LevelDropper(path, projectService) {
  this.path = path;
  this.projectService = projectService;
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
LevelDropper.attachKey = 'storage.level.dropper';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {BBPromise} A LevelDropper instance with resolved dependencies
 */
LevelDropper.attach = function(app) {
  var path = app.config.level.path;
  return app.get('project.service')
    .then(function(projectService) {
      return new LevelDropper(path, projectService);
    });
};

/**
 * Create / migrate database.
 *
 * @param  {String} projectId
 * @param  {Number} projectVersion
 *
 * @return {BBPromise.<undefined>}
 */
LevelDropper.prototype.drop = function(projectId) {
  var self = this;

  return this.projectService.getProjectVersion(projectId)
    .then(function (projectVersion) {
      if (_.isNumber(projectVersion) && projectVersion > 0) {
        var versions = _.range(1, projectVersion + 1);

        return BBPromise.all(_.map(versions, function (version) {
          var leveldb = projectId + 'v' + version;
          
          return rmRF(self.path + '/' + leveldb)
            .catch(function (err) {
              // db doesn't exist
              // noop
            });
        }));
      }
    });
};

module.exports = LevelDropper;
