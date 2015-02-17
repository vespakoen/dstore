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
/////////////////////////// BLUEPRINT ACTIONS /////////////////////////
////////////////////////////////////////////////////////////////////

// blueprintFacade.getSnapshotVersions()
server.get('/', createHandler('get-snapshot-versions'));

// blueprintFacade.createSnapshot()
server.post('/:namespace/snapshots', createHandler('create-snapshot', function (req) {
  return {
    namespace: req.params.namespace
  }
}));

// blueprintFacade.getSnapshot(namespace, snapshotVersion)
server.get('/:namespace/snapshots/:snapshot_version', createHandler('get-snapshot', function (req) {
  return {
    namespace: req.params.namespace,
    snapshot_version: req.params.snapshot_version
  };
}));

// blueprintFacade.getBlueprint(namespace, blueprintKey, snapshotVersion='current')
server.get('/:namespace/blueprints/:blueprint_key/:snapshot_version', createHandler('get-blueprint', function (req) {
  return {
    namespace: req.params.namespace,
    snapshot_version: req.params.snapshot_version,
    blueprint_key: req.params.blueprint_key
  };
}));

// blueprintFacade.putBlueprint(namespace, blueprintKey)
server.put('/:namespace/blueprints/:blueprint_key', createHandler('put-blueprint', function (req) {
  return {
    namespace: req.params.namespace,
    blueprint_key: req.params.blueprint_key,
    blueprint: JSON.parse(req.body)
  };
}));

////////////////////////////////////////////////////////////////////
//////////////////////////// ITEM ACTIONS //////////////////////////
////////////////////////////////////////////////////////////////////

// projector.putItem(namespace, blueprintKey, <generated-uuid>, item)
server.post('/:namespace/items/:blueprint_key', createHandler('create-item', function (req) {
  return {
    namespace: req.params.namespace,
    blueprint_key: req.params.blueprint_key,
    item: JSON.parse(req.body)
  };
}));

// projector.putItem(namespace, blueprintKey, id, item)
server.put('/:namespace/items/:blueprint_key/:id', createHandler('put-item', function (req) {
  return {
    namespace: req.params.namespace,
    blueprint_key: req.params.blueprint_key,
    id: req.params.id,
    item: JSON.parse(req.body)
  };
}));

// projector.delItem(namespace, blueprintKey, id)
server.del('/:namespace/items/:blueprint_key/:id', createHandler('del-item', function (req) {
  return {
    namespace: req.params.namespace,
    blueprint_key: req.params.blueprint_key,
    id: req.params.id
  };
}));

////////////////////////////////////////////////////////////////////
//////////////////////////// SERVER SETUP //////////////////////////
////////////////////////////////////////////////////////////////////

server.listen(Number(process.env.PORT), function () {
  console.log('API started at %s', server.url);
});

////////////////////////////////////////////////////////////////////
////////////////////////// GRACEFUL SHUTDOWN////////////////////////
////////////////////////////////////////////////////////////////////

process.on('SIGTERM', function () {
  server.close();
  console.log('API stopping...');

  if ( ! queue) process.exit(0);
  queue.close(function () {
    process.exit(0);
  });
});
