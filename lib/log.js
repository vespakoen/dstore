'use strict';

var _ = require('underscore');

var production = process.env.PRODUCTION ? true : false;

module.exports = {
  log: function (theme, args) {
    if (production !== true) console.log.apply(console.log, ['[' + theme.toUpperCase() + '] -'].concat(args));
  },
  info: function () {
    var args = Array.prototype.slice.call(arguments);
    this.log('info', args);
  },
  warn: function () {
    var args = Array.prototype.slice.call(arguments);
    this.log('warn', args);
  },
  error: function () {
    var args = Array.prototype.slice.call(arguments);
    this.log('error', args);
  },
  debug: function () {
    var args = Array.prototype.slice.call(arguments);
    this.log('debug', args);
  }
};
