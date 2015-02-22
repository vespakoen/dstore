'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var app = require('../main');
var api = require('./lib/api');
var blueprint = require('./lib/blueprint');
var project = require('./lib/project');
var router = require('./lib/router');

api()
  .then(router)
  .then(blueprint)
  .then(project)
  .then(function () {
    console.log('Projector started');
  });

process.on('SIGTERM', function () {
  app.get('queue')
    .then(function (queue) {
      queue.close(function () {
        console.log('Disconnecting from queue...');
        process.exit(0);
      });
    });
});
