var kue = require('kue');
var _ = require('underscore');
var BBPromise = require('bluebird');

var initRestApi = require('./initializer/restApiInitializer');
var initBlueprint = require('./initializer/blueprintInitializer');
var initProject = require('./initializer/projectInitializer');
var initRouter = require('./initializer/routerInitializer');
var initSync = require('./initializer/syncInitializer');

module.exports = function (app) {
  return initRestApi(app)
    .then(function() {
      return initBlueprint(app);
    })
    .then(function () {
      return initProject(app);
    })
    .then(function () {
      return initRouter(app);
    })
    .then(function () {
      return initSync(app);
    })
    .then(function () {
      if (app.config.queue.client === 'kue') {
        kue.app.set('title', 'dstore queue');
        var port = app.config.queue.kue.port;
        kue.app.listen(port);
        console.log('Kue web interface started and listening on port ' + port + ' ...');
      }
    });
};
