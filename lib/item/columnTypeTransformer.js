'use strict';

var _ = require('underscore');
var geojsonCoords = require('geojson-coords');

/**
 * ColumnTypeTransformer
 * 
 * @class item.ColumnTypeTransformer
 * 
 * @param {schema.SchemaAdapter} schemaAdapter
 */
function ColumnTypeTransformer(schemaAdapter) {
  this.schemaAdapter = schemaAdapter;
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
ColumnTypeTransformer.attachKey = 'item.column.type.transformer';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {BBPromise} An ColumnTypeTransformer instance with resolved dependencies.
 */
ColumnTypeTransformer.attach = function (app) {
  return app.get('schema.adapter')
    .then(function (schemaAdapter) {
      return new ColumnTypeTransformer(schemaAdapter);
    });
};

ColumnTypeTransformer.prototype.transform = function(value, fromType, toType) {
  // example input: fromType=string, toType=string[]
  // output: method=_transformToStringArray('integer[]', value)
  var method = '_transformTo' + help.capitalizeFirstLetter(toType.replace('[]', 'Array'));

  // null stays null
  if (value === null) {
    return null;
  }

  // same type stays same
  if (fromType === toType) {
    return value;
  }

  // call method when it exists
  if (this[method]) {
    return this[method](value, fromType);
  }

  // didn't manage to transform, return null
  return null;
};

/**
 * Transform value to a uuid array.
 * In this case we will simply stringify the best we can
 * 
 * @param  {*} value
 * @param  {String} fromType
 * @return {String}
 */
ColumnTypeTransformer.prototype._transformToUuidArray = function (value, fromType) {
  // uuid's can be converted to an array
  if (fromType === 'uuid') {
    return [value];
  }

  // the rest cannot be converted
  return null;
};

/**
 * Transform value to a string.
 * In this case we will simply stringify the best we can
 * 
 * @param  {*} value
 * @param  {String} fromType
 * @return {String}
 */
ColumnTypeTransformer.prototype._transformToString = function (value, fromType) {
  // stringify
  value = this._transformToText(value, fromType);

  // cut off if it's too much
  if (value.length > 255) {
    return value.substring(0, 251) + ' ...';
  }

  return value;
};

/**
 * Transform value to a string array.
 * 
 * @param  {*} value
 * @param  {String} fromType
 * @return {String}
 */
ColumnTypeTransformer.prototype._transformToStringArray = function (value, fromType) {
  return _.map(this._transformToTextArray(value, fromType), function (value) {
    if (value.length > 255) {
      return value.substring(0, 251) + ' ...';
    }
    return value;
  });
};

/**
 * Transform value to a text.
 * In this case we will simply stringify the best we can
 * 
 * @param  {*} value
 * @param  {String} fromType
 * @return {String}
 */
ColumnTypeTransformer.prototype._transformToText = function (value, fromType) { 
  if (_.isDate(value)) {
    return value.toString();
  }
  
  if (_.isObject(value) || _.isArray(value)) {
    return JSON.stringify(value);
  }

  return "" + value;
};


/**
 * Transform value to a text array.
 * 
 * @param  {*} value
 * @param  {String} fromType
 * @return {String}
 */
ColumnTypeTransformer.prototype._transformToTextArray = function (value, fromType) {
  switch (fromType) {
    // these can stay the same
    case 'uuid[]':
    case 'string[]':
      return value;

    // these will be stringified
    case 'date[]':
    case 'datetime[]':
    case 'float[]':
    case 'integer[]':
    case 'boolean[]':
    case 'json[]':
      return _.map(value, function (val) {
        return this._transformToText(value, fromType);
      }, this);

    // these will be stringified and be put as the first item in the array
    case 'point[]':
    case 'linestring[]':
    case 'polygon[]':
    case 'uuid':
    case 'string':
    case 'text':
    case 'point':
    case 'linestring':
    case 'polygon':
    case 'date':
    case 'datetime':
    case 'float':
    case 'integer':
    case 'boolean':
    case 'json':
      return [this._transformToText(value, fromType)];
  }
};

/**
 * Transform value to a point.
 * 
 * @param  {*} value
 * @param  {String} fromType
 * @return {String}
 */
ColumnTypeTransformer.prototype._transformToPoint = function (value, fromType) {
  switch (fromType) {
    // we can get the center of these
    case 'linestring':
    case 'polygon':
    case 'point[]',
    case 'linestring[]':
    case 'polygon[]':
      return this._getCentroidPointOfGeoJson(value);
  }

  return null;
};

/**
 * Transform value to a point array.
 * 
 * @param  {*} value
 * @param  {String} fromType
 * @return {String}
 */
ColumnTypeTransformer.prototype._transformToPointArray = function (value, fromType) {
  switch (fromType) {
    // we can get the center of these
    case 'linestring':
    case 'polygon':
    case 'point[]',
    case 'linestring[]':
    case 'polygon[]':
      var point = this._getCentroidPointOfGeoJson(value);
      point.type = 'MultiPoint';
      point.coordinates = [point.coordinates];
      return point;
  }

  return null;
};

/**
 * Transform value to a date.
 * 
 * @param  {*} value
 * @param  {String} fromType
 * @return {String}
 */
ColumnTypeTransformer.prototype._transformToDate = function (value, fromType) {
  if (fromType === 'datetime') {
    return value.substring(0, 'yyyy-mm-dd'.length);
  }

  if (fromType === 'datetime[]' || fromType === 'date[]') {
    return value[0] ? value[0].substring(0, 'yyyy-mm-dd'.length) : null;
  }

  return null;
};

/**
 * Transform value to a date.
 * 
 * @param  {*} value
 * @param  {String} fromType
 * @return {String}
 */
ColumnTypeTransformer.prototype._transformToDateArray = function (value, fromType) {
  if (fromType === 'datetime' || fromType === 'date') {
    return value.substring(0, 'yyyy-mm-dd'.length);
  }

  if (fromType === 'datetime[]') {
    return value[0] ? value[0].substring(0, 'yyyy-mm-dd'.length) : null;
  }

  return null;
};

ColumnTypeTransformer.prototype._getCentroidPointOfGeoJson = function (value) {
  var coords = geojsonCoords(value);

  var minX, minY, maxX, maxY = null;
  _.each(coords, function (coord) {
    if (minX === null || minX > coord[0]) {
      minX = coord[0];
    }
    if (maxX === null || maxX < coord[0]) {
      maxX = coord[0];
    }
    if (minY === null || minY > coord[0]) {
      minY = coord[0];
    }
    if (maxY === null || maxY < coord[0]) {
      maxY = coord[0];
    }
  });

  return {
    "type": "Point",
    "coordinates": [(minX + maxX) / 2, (minY + maxY) / 2]
  };
};

module.exports = ColumnTypeTransformer;
