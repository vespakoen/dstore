'use strict';

var restify = require('restify');
var app = require('../bootstrap');

var server = restify.createServer({
  name: 'myapp',
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
      .then(function (queue) {
        queue.publish(key, createCommand ? createCommand(req) : {})
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
    schemas: req.params.schemas
  };
}));

server.put('/api/schema/:namespace/:schemaKey', createHandler('put-schema', function (req) {
  return {
    namespace: req.params.namespace,
    key: req.params.schemaKey,
    schema: req.params.schema
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

server.get('/api/item/:namespace/:schemaKey', createHandler('put-item', function (req) {
  return {
    namespace: req.params.namespace,
    key: req.params.schemaKey,
    item: req.params.item
  };
}));
server.del('/api/item/:namespace/:schemaKey', createHandler('del-item', function (req) {
  return {
    namespace: req.params.namespace,
    key: req.params.schemaKey,
    version: req.params.version,
    item: req.params.item
  };
}));

server.listen(2000, function () {
  console.log('%s listening at %s', server.name, server.url);
});
