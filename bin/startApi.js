'use strict';

var restify = require('restify');
var _ = require('underscore');
var app = require('../main');

var queue;

var pkg = require('../package');
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
    app.get('queue')
      .then(function (q) {
        queue = q;

        q.publish('queue', {
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
      });
  };
}

////////////////////////////////////////////////////////////////////
///////////////////////// BLUEPRINT ACTIONS ////////////////////////
////////////////////////////////////////////////////////////////////

// blueprintFacade.getBlueprint(project_id, blueprint_id, snapshotVersion)
server.get('/:project_id/:blueprint_id/_blueprint/:snapshot_version', createHandler('get-blueprint', function (req) {
  return {
    project_id: req.params.project_id,
    blueprint_id: req.params.blueprint_id,
    snapshot_version: req.params.snapshot_version
  };
}));

// blueprintFacade.getBlueprint(project_id, blueprint_id, 'current')
server.get('/:project_id/:blueprint_id/_blueprint', createHandler('get-blueprint', function (req) {
  return {
    project_id: req.params.project_id,
    blueprint_id: req.params.blueprint_id,
    snapshot_version: 'current'
  };
}));

// blueprintFacade.putBlueprint(project_id, blueprint_id, blueprintId)
server.put('/:project_id/:blueprint_id/_blueprint', createHandler('put-blueprint', function (req) {
  return {
    project_id: req.params.project_id,
    blueprint_id: req.params.blueprint_id,
    blueprint: req.body
  };
}));

// blueprintFacade.getAllBlueprints(project_id, snapshotVersion)
server.get('/:project_id/_blueprint/:snapshot_version', createHandler('get-all-blueprints', function (req) {
  return {
    project_id: req.params.project_id,
    snapshot_version: req.params.snapshot_version
  };
}));

// blueprintFacade.getAllBlueprints(project_id, 'current')
server.get('/:project_id/_blueprint', createHandler('get-all-blueprints', function (req) {
  return {
    project_id: req.params.project_id,
    snapshot_version: 'current'
  };
}));

// blueprintFacade.getBlueprintVersions(project_id)
server.get('/:project_id/:blueprint_id/_version', createHandler('get-blueprint-versions', function (req) {
  return {
    project_id: req.params.project_id,
    blueprint_id: req.params.blueprint_id
  }
}));

////////////////////////////////////////////////////////////////////
////////////////////////// SNAPSHOT ACTIONS ////////////////////////
////////////////////////////////////////////////////////////////////

// blueprintFacade.createSnapshot()
server.post('/:project_id/_snapshot', createHandler('create-snapshot', function (req) {
  return {
    project_id: req.params.project_id
  }
}));

// blueprintFacade.getSnapshotVersion()
server.get('/:project_id/_version', createHandler('get-snapshot-version', function (req) {
  return {
    project_id: req.params.project_id
  }
}));

////////////////////////////////////////////////////////////////////
//////////////////////////// ITEM ACTIONS //////////////////////////
////////////////////////////////////////////////////////////////////

// projector.createItem(project_id, blueprint_id, item)
server.post('/:project_id/:blueprint_id', createHandler('create-item', function (req) {
  return {
    project_id: req.params.project_id,
    blueprint_id: req.params.blueprint_id,
    item: req.body
  };
}));

// projector.putItem(project_id, blueprint_id, id, item)
server.put('/:project_id/:blueprint_id/:id', createHandler('put-item', function (req) {
  return {
    project_id: req.params.project_id,
    blueprint_id: req.params.blueprint_id,
    id: req.params.id,
    item: req.body
  };
}));

// projector.delItem(project_id, blueprint_id, id)
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

////////////////////////////////////////////////////////////////////
////////////////////////// GRACEFUL SHUTDOWN ///////////////////////
////////////////////////////////////////////////////////////////////

process.on('SIGTERM', function () {
  server.close();
  console.log('API stopping...');

  if ( ! queue) process.exit(0);
  queue.close(function () {
    process.exit(0);
  });
});
