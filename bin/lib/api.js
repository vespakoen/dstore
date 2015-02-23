'use strict';

var restify = require('restify');
var BBPromise = require('bluebird');
var _ = require('underscore');
var app = require('../../main');
var pkg = require('../../package');

module.exports = function () {
  return app.get('queue')
    .then(function (queue) {
      return queue.setupPublisher();
    })
    .then(function (publisher) {
      var server = restify.createServer({
        name: pkg.name,
        version: pkg.version
      });

      server.use(restify.acceptParser(server.acceptable));
      server.use(restify.CORS());
      server.use(restify.fullResponse());
      server.use(restify.queryParser());
      server.use(restify.bodyParser());
      server.pre(restify.pre.sanitizePath());

      function createHandler(key, createCommand) {
        return function (req, res, next) {
          publisher.publish('queue', {
            key: key,
            command: createCommand ? createCommand(req) : {}
          })
          .then(function (result) {
            res.send(result);
            return next();
          })
          .catch(function (err) {
            console.error(err);

            // throw err;
            var response = {
              status: err.message
            };

            if (err.errors) {
              response.errors = err.errors;
            }

            res.send(400, response);
            return next();
          });
        };
      }

      ////////////////////////////////////////////////////////////////////
      ////////////////////////// PROJECT ACTIONS /////////////////////////
      ////////////////////////////////////////////////////////////////////

      // projectFacade.getAllProjects()
      server.get('/_project', createHandler('get-all-projects'));

      // projectFacade.getAllProjects()
      server.del('/_project', createHandler('del-all-projects'));

      // projectFacade.getAllProjectVersions()
      server.get('/_version', createHandler('get-all-project-versions'));
      
      // projectFacade.tagAllProjects()
      server.post('/_version', createHandler('tag-all-projects'));

      // projectFacade.getProject(project_id)
      server.get('/:project_id/_project', createHandler('get-project', function (req) {
        return {
          project_id: req.params.project_id
        };
      }));

      // projectFacade.putProject(project_id, blueprints)
      server.put('/:project_id/_project', createHandler('put-project', function (req) {
        return {
          project_id: req.params.project_id,
          blueprints: req.body
        };
      }));

      // projectFacade.delProject(project_id)
      server.del('/:project_id/_project', createHandler('del-project', function (req) {
        return {
          project_id: req.params.project_id
        };
      }));

      // projectFacade.getProjectVersion(project_id)
      server.get('/:project_id/_version', createHandler('get-project-version', function (req) {
        return {
          project_id: req.params.project_id
        };
      }));

      // projectFacade.getProjectVersion(project_id)
      server.del('/:project_id/_version', createHandler('get-project-version', function (req) {
        return {
          project_id: req.params.project_id
        };
      }));

      // projectFacade.tagProject(project_id)
      server.post('/:project_id/_version', createHandler('tag-project', function (req) {
        return {
          project_id: req.params.project_id
        };
      }));

      ////////////////////////////////////////////////////////////////////
      ///////////////////////// BLUEPRINT ACTIONS ////////////////////////
      ////////////////////////////////////////////////////////////////////

      // blueprintFacade.getBlueprint(project_id, blueprint_id, projectVersion)
      server.get('/:project_id/:blueprint_id/_blueprint/:project_version', createHandler('get-blueprint', function (req) {
        return {
          project_id: req.params.project_id,
          blueprint_id: req.params.blueprint_id,
          project_version: req.params.project_version
        };
      }));

      // blueprintFacade.getBlueprint(project_id, blueprint_id, 'current')
      server.get('/:project_id/:blueprint_id/_blueprint', createHandler('get-blueprint', function (req) {
        return {
          project_id: req.params.project_id,
          blueprint_id: req.params.blueprint_id,
          project_version: 'current'
        };
      }));

      // blueprintFacade.putBlueprint(project_id, blueprint_id, blueprint)
      server.put('/:project_id/:blueprint_id/_blueprint', createHandler('put-blueprint', function (req) {
        return {
          project_id: req.params.project_id,
          blueprint_id: req.params.blueprint_id,
          blueprint: req.body
        };
      }));

      // blueprintFacade.delBlueprint(project_id, blueprint_id)
      server.del('/:project_id/:blueprint_id/_blueprint', createHandler('del-blueprint', function (req) {
        return {
          project_id: req.params.project_id,
          blueprint_id: req.params.blueprint_id
        };
      }));

      // blueprintFacade.getBlueprintVersions(project_id, blueprint_id)
      server.get('/:project_id/:blueprint_id/_version', createHandler('get-blueprint-versions', function (req) {
        return {
          project_id: req.params.project_id,
          blueprint_id: req.params.blueprint_id
        };
      }));

      // blueprintFacade.getAllBlueprints(project_id, projectVersion)
      server.get('/:project_id/_blueprint/:project_version', createHandler('get-all-blueprints', function (req) {
        return {
          project_id: req.params.project_id,
          project_version: req.params.project_version
        };
      }));


      // blueprintFacade.getAllBlueprints(project_id, 'current')
      server.get('/:project_id/_blueprint', createHandler('get-all-blueprints', function (req) {
        return {
          project_id: req.params.project_id,
          project_version: 'current'
        };
      }));

      // @todo put-many-blueprints

      // @todo del-many-blueprints

      ////////////////////////////////////////////////////////////////////
      //////////////////////////// ITEM ACTIONS //////////////////////////
      ////////////////////////////////////////////////////////////////////

      // storage.putItem(project_id, blueprint_id, id, item)
      server.put('/:project_id/:blueprint_id/:id', createHandler('put-item', function (req) {
        return {
          project_id: req.params.project_id,
          blueprint_id: req.params.blueprint_id,
          id: req.params.id,
          item: req.body
        };
      }));

      // storage.delItem(project_id, blueprint_id, id)
      server.del('/:project_id/:blueprint_id/:id', createHandler('del-item', function (req) {
        return {
          project_id: req.params.project_id,
          blueprint_id: req.params.blueprint_id,
          id: req.params.id
        };
      }));

      ////////////////////////////////////////////////////////////////////
      //////////////////////////// SERVER SETUP //////////////////////////
      ////////////////////////////////////////////////////////////////////

      server.listen(Number(process.env.API_PORT || process.env.PORT), function () {
        console.log('API started at %s', server.url);
      });
    });
};
