'use strict';

/**
 * IOC attachKey.
 *
 * @type {String}
 */
exports.attachKey = 'queue';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {BBPromise|Object} The object with resolved dependencies
 */
var queue;
exports.attach = function(app) {
  if ( ! queue) {
    queue = app.get('queue.client.' + app.config.queue.client);
  }
  return queue;
};
