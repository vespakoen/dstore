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

        q.publish(key, createCommand ? createCommand(req) : {})
          .then(function (result) {
            res.send(result);
            return next();
          })
          .catch(function (err) {
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
/////////////////////////// SCHEMA ACTIONS /////////////////////////
////////////////////////////////////////////////////////////////////

// schemaFacade.getSnapshotVersions()
server.get('/api', createHandler('get-snapshot-versions'));

// schemaFacade.createSnapshot()
server.post('/api/:namespace/snapshots', createHandler('create-snapshot', function (req) {
  return {
    namespace: req.params.namespace
  }
}));

// schemaFacade.getSnapshot(namespace, snapshotVersion)
server.get('/api/:namespace/snapshots/:snapshot_version', createHandler('get-snapshot', function (req) {
  return {
    namespace: req.params.namespace,
    snapshot_version: req.params.snapshot_version
  };
}));

// schemaFacade.getSchema(namespace, schemaKey, snapshotVersion='current')
server.get('/api/:namespace/schemas/:schema_key/:snapshot_version', createHandler('get-schema', function (req) {
  return {
    namespace: req.params.namespace,
    snapshot_version: req.params.snapshot_version,
    schema_key: req.params.schema_key
  };
}));

// schemaFacade.putSchema(namespace, schemaKey)
server.put('/api/:namespace/schemas/:schema_key', createHandler('put-schema', function (req) {
  return {
    namespace: req.params.namespace,
    schema_key: req.params.schema_key,
    schema: req.body
  };
}));

////////////////////////////////////////////////////////////////////
//////////////////////////// ITEM ACTIONS //////////////////////////
////////////////////////////////////////////////////////////////////

// projector.putItem(namespace, schemaKey, <generated-uuid>, item)
server.post('/api/:namespace/items/:schema_key', createHandler('create-item', function (req) {
  return {
    namespace: req.params.namespace,
    schema_key: req.params.schema_key,
    item: req.body
  };
}));

// projector.putItem(namespace, schemaKey, id, item)
server.put('/api/:namespace/items/:schema_key/:id', createHandler('put-item', function (req) {
  return {
    namespace: req.params.namespace,
    schema_key: req.params.schema_key,
    id: req.params.id,
    item: req.body
  };
}));

// projector.delItem(namespace, schemaKey, id)
server.del('/api/:namespace/items/:schema_key/:id', createHandler('del-item', function (req) {
  return {
    namespace: req.params.namespace,
    schema_key: req.params.schema_key,
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
