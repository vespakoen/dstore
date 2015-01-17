'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');;

/**
 * The app object.
 *
 * @class App
 * @param {Object} props
 */
function App(props) {
  _.extend(this, props);
  this.components = {};
}

/**
 * Register a component in the app.
 *
 * @param {*} component
 */
App.prototype.use = function(component) {
  this.components[component.attachKey] = component;
};

/**
 * Get a component from the app (singleton).
 *
 * @param {String} key
 * @returns {Promise} The instatiated component
 */
App.prototype.get = function(key) {
  var component = this.components[key];
  if (!(this[key] || component)) {
    throw new Error(key + ' component not registered in the app!');
  }
  return new BBPromise(function(resolve) {
    return component ? resolve(component.attach(this)) : resolve(this[key]);
  }.bind(this));
};

module.exports = App;
