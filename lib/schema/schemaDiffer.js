'use strict';

var _ = require('underscore');
var deep = require('deep-diff');

function SchemaDiffer() {}

SchemaDiffer.attachKey = 'schema.differ';

SchemaDiffer.attach = function(app) {
  return new SchemaDiffer();
};

SchemaDiffer.prototype.diff = function(schemaKey, from, to) {
  var changes = this._extractChanges(schemaKey, from, to);
  console.log('changes', changes);
  return this._sortChanges(changes);
};

SchemaDiffer.prototype.invertChanges = function(changes) {
  changes = changes.reverse();
  return _.filter(_.map(changes, this._invertChange), function(change) {
    return change !== undefined;
  });
};

SchemaDiffer.prototype.getRenamedSchema = function(schema) {
  var clone = _.object(_.map(schema, function(v, k) {
    return [k, _.clone(v)];
  }));

  if (clone.key) {
    delete clone.key;
  }

  _.each(clone.columns, function(column, key) {
    if (column.key) {
      clone.columns[column.key] = _.omit(clone.columns[key], 'key');
      delete clone.columns[key];
    }
  });

  return clone;
};

SchemaDiffer.prototype._extractChanges = function(schemaKey, from, to) {
  if (!from && _.isEmpty(to)) {
    return [];
  }

  if (!from) {
    return [{
      type: 'schema.create',
      schema: schemaKey,
      value: to
    }];
  }

  if (_.isEmpty(to)) {
    return [{
      type: 'schema.remove',
      schema: schemaKey,
      oldValue: this.getRenamedSchema(from)
    }];
  }

  var changes = [];
  deep.observableDiff(this.getRenamedSchema(from), to, function(diff) {
    if (this._isSchemaRename(diff)) {
      changes.push({
        type: 'schema.rename',
        schema: schemaKey,
        value: diff.rhs
      });
    }

    if (this._isSchemaUpdate(diff)) {
      changes.push({
        type: 'schema.update',
        schema: schemaKey,
        key: diff.path[0],
        oldValue: diff.lhs,
        value: diff.rhs
      });
    }

    if (this._isColumnCreate(diff)) {
      changes.push({
        type: 'column.create',
        schema: schemaKey,
        column: diff.path[1],
        value: diff.rhs
      });
    }

    if (this._isColumnUpdate(diff)) {
      changes.push({
        type: 'column.update',
        schema: schemaKey,
        column: diff.path[1],
        key: diff.path[2],
        oldValue: diff.lhs,
        value: diff.rhs
      });
    }

    if (this._isColumnRename(diff)) {
      changes.push({
        type: 'column.rename',
        schema: schemaKey,
        column: diff.path[1],
        value: diff.rhs
      });
    }

    if (this._isColumnRemove(diff)) {
      changes.push({
        type: 'column.remove',
        schema: schemaKey,
        column: diff.path[1],
        oldValue: diff.lhs
      });
    }
  }.bind(this));

  return changes;
};

SchemaDiffer.prototype._isSchemaRename = function(diff) {
  return diff.path[0] == 'key';
};

SchemaDiffer.prototype._isSchemaUpdate = function(diff) {
  return diff.path[0] !== 'key' && diff.path[0] !== 'columns';
};

SchemaDiffer.prototype._isColumnCreate = function(diff) {
  return diff.path[0] == 'columns' && diff.kind === 'N' && !diff.path[2];
};

SchemaDiffer.prototype._isColumnRename = function(diff) {
  return diff.path[0] == 'columns' && diff.kind === 'N' && diff.path[2] && diff.path[2] === 'key' && diff.path[1] !== diff.rhs;
};

SchemaDiffer.prototype._isColumnRemove = function(diff) {
  return diff.path[0] == 'columns' && diff.kind === 'D' && !diff.path[2];
};

SchemaDiffer.prototype._isColumnUpdate = function(diff) {
  return diff.path[0] == 'columns' && diff.kind === 'E' && diff.path[2] && diff.path[2] !== 'key';
};

SchemaDiffer.prototype._sortChanges = function(changes) {
  var rename = _.findWhere(changes, {type: 'schema.rename'});
  return _.sortBy(changes, function(change) {
    var weight = 0;
    if (change.type === 'column.rename')
      weight++;
    if (change.type === 'schema.rename')
      weight += 2;
    if (rename && change.schema === rename.value)
      weight += 3;
    return weight;
  });
};

SchemaDiffer.prototype._invertChange = function(change) {
  switch (change.type) {
    case 'schema.create':
      return {
        type: 'schema.remove',
        schema: change.schema
      };
    case 'schema.rename':
      return {
        type: 'schema.rename',
        schema: change.value,
        value: change.schema
      };
    case 'schema.update':
      return {
        type: 'schema.update',
        schema: change.schema,
        key: change.key,
        value: change.oldValue,
        oldValue: change.value
      };
    case 'schema.remove':
      return {
        type: 'schema.create',
        schema: change.schema,
        value: change.oldValue
      };
    case 'column.create':
      return {
        type: 'column.remove',
        schema: change.schema,
        column: change.column
      };
    case 'column.rename':
      return {
        type: 'column.rename',
        schema: change.schema,
        column: change.value,
        value: change.column
      };
    case 'column.update':
      return {
        type: 'column.update',
        schema: change.schema,
        column: change.column,
        key: change.key,
        oldValue: change.value,
        value: change.oldValue
      };
    case 'column.remove':
      return {
        type: 'column.create',
        schema: change.schema,
        column: change.column,
        value: change.oldValue
      };
  }
};

module.exports = SchemaDiffer;