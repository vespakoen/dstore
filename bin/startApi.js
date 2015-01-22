'use strict';

var restify = require('restify');
var _ = require('underscore');
var app = require('../main');

var queue;

var server = restify.createServer({
  name: 'projector',
  version: '1.0.0'
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
          }, function (err) {
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

server.get('/api/schema/:namespace', createHandler('get-all-schemas', function (req) {
  return {
    namespace: req.params.namespace
  };
}));

server.get('/api/schema/:namespace/:schemaKey', createHandler('get-schema', function (req) {
  return {
    namespace: req.params.namespace,
    key: req.params.schemaKey
  };
}));

server.put('/api/schema/:namespace', createHandler('put-all-schemas', function (req) {
  return {
    namespace: req.params.namespace,
    schemas: _.omit(req.params, 'namespace')
  };
}));

server.put('/api/schema/:namespace/:schemaKey', createHandler('put-schema', function (req) {
  return {
    namespace: req.params.namespace,
    key: req.params.schemaKey,
    schema: _.omit(req.params, 'namespace', 'schemaKey')
  };
}));

server.post('/api/snapshot/:namespace', createHandler('create-snapshot', function (req) {
  return {
    namespace: req.params.namespace
  };
}));

////////////////////////////////////////////////////////////////////
//////////////////////////// ITEM ACTIONS //////////////////////////
////////////////////////////////////////////////////////////////////

server.put('/api/item/:namespace/:schemaKey', createHandler('put-item', function (req) {
  return {
    namespace: req.params.namespace,
    key: req.params.schemaKey,
    item: _.omit(req.params, 'namespace', 'schemaKey')
  };
}));
server.del('/api/item/:namespace/:schemaKey/:snapshotVersion/:id', createHandler('del-item', function (req) {
  return {
    namespace: req.params.namespace,
    key: req.params.schemaKey,
    snapshot_version: req.params.snapshotVersion,
    id: req.params.id
  };
}));

server.listen(Number(process.env.API_PORT), function () {
  console.log('API started at %s', server.url);
});

process.on('SIGTERM', function () {
  server.close();
  console.log('API stopping...');

  if ( ! queue) process.exit(0);
  queue.close(function () {
    process.exit(0);
  });
});
