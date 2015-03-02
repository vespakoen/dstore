'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var argv = require('minimist')(process.argv.slice(2));
var config = require('../config');
var app = require('../main')(config);
var initStore = require('../lib/initializer/storeInitializer');

var boot;

if (argv.store) {
  console.log('Starting dstore storage worker for ' + argv.store);
  boot = initStore(app, argv.store);
} else if (argv.all) {
  console.log('Starting dstore all in one service');
  boot = app.init()
    .then(function () {
      var stores = app.config.stores;

      var promises = _.map(stores, function (store) {
        return initStore(app, store);
      });

      return BBPromise.all(promises);
    });
} else {
  console.log('Starting dstore project worker');
  boot = app.init();
}

boot.then(function () {
  console.log('dstore started sucessfully');
})
.catch(function (err) {
  console.error('There was a problem while starting dstore', err);
  throw err;
});
