'use strict';

var _ = require('underscore');

/**
 * Generic helper functions
 *
 * @class Helpers
 */
module.exports = {
  /**
   * Returns a new string where the first character is capitalized.
   *
   * @param  {String} string
   * @return {String}
   */
  capitalizeFirstLetter: function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  /**
   * Serializes an error.
   * 
   * @param  {Error} err
   * 
   * @return {Object} The serialized error
   */
  serializeError: function (err) {
    var serialized = {};
    var storeKey = function (key) {
      serialized[key] = err[key];
    };
    Object.getOwnPropertyNames(err)
      .forEach(storeKey);
    return serialized;
  },

  /**
   * Unserializes an error.
   * 
   * @param  {Object} obj The serialized error
   * 
   * @return {Error} The unserialized error
   */
  unserializeError: function (obj) {
    var err = new Error(obj.message);

    _.each(obj, function (value, key) {
      if (obj.hasOwnProperty(key) && key !== 'message') {
        err[key] = value;
      }
    });

    return err;
  }
};
