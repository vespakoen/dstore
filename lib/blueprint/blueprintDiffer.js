'use strict';

var _ = require('underscore');
var deep = require('deep-diff');

function BlueprintDiffer() {}

BlueprintDiffer.attachKey = 'blueprint.differ';

BlueprintDiffer.attach = function(app) {
  return new BlueprintDiffer();
};

BlueprintDiffer.prototype.diff = function(blueprintKey, from, to) {
  var changes = this._extractChanges(blueprintKey, from, to);
  return this._sortChanges(changes);
};

BlueprintDiffer.prototype.invertChanges = function(changes) {
  changes = changes.reverse();
  return _.filter(_.map(changes, this._invertChange), function(change) {
    return change !== undefined;
  });
};

BlueprintDiffer.prototype.getRenamedBlueprint = function(blueprint) {
  var clone = _.object(_.map(blueprint, function(v, k) {
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

BlueprintDiffer.prototype._extractChanges = function(blueprintKey, from, to) {
  if (!from && _.isEmpty(to)) {
    return [];
  }

  if (!from) {
    return [{
      type: 'blueprint.create',
      blueprint: blueprintKey,
      value: to
    }];
  }

  if (_.isEmpty(to)) {
    return [{
      type: 'blueprint.remove',
      blueprint: blueprintKey,
      oldValue: this.getRenamedBlueprint(from)
    }];
  }

  var changes = [];
  deep.observableDiff(this.getRenamedBlueprint(from), to, function(diff) {
    if (this._isBlueprintRename(diff)) {
      changes.push({
        type: 'blueprint.rename',
        blueprint: blueprintKey,
        value: diff.rhs
      });
    }

    if (this._isBlueprintUpdate(diff)) {
      changes.push({
        type: 'blueprint.update',
        blueprint: blueprintKey,
        key: diff.path[0],
        oldValue: diff.lhs,
        value: diff.rhs
      });
    }

    if (this._isColumnCreate(diff)) {
      changes.push({
        type: 'column.create',
        blueprint: blueprintKey,
        column: diff.path[1],
        value: diff.rhs
      });
    }

    if (this._isColumnUpdate(diff)) {
      changes.push({
        type: 'column.update',
        blueprint: blueprintKey,
        column: diff.path[1],
        key: diff.path[2],
        oldValue: diff.lhs,
        value: diff.rhs
      });
    }

    if (this._isColumnRename(diff)) {
      changes.push({
        type: 'column.rename',
        blueprint: blueprintKey,
        column: diff.path[1],
        value: diff.rhs
      });
    }

    if (this._isColumnRemove(diff)) {
      changes.push({
        type: 'column.remove',
        blueprint: blueprintKey,
        column: diff.path[1],
        oldValue: diff.lhs
      });
    }
  }.bind(this));

  return changes;
};

BlueprintDiffer.prototype._isBlueprintRename = function(diff) {
  return diff.path[0] == 'key';
};

BlueprintDiffer.prototype._isBlueprintUpdate = function(diff) {
  return diff.path[0] !== 'key' && diff.path[0] !== 'columns';
};

BlueprintDiffer.prototype._isColumnCreate = function(diff) {
  return diff.path[0] == 'columns' && diff.kind === 'N' && !diff.path[2];
};

BlueprintDiffer.prototype._isColumnRename = function(diff) {
  return diff.path[0] == 'columns' && diff.kind === 'N' && diff.path[2] && diff.path[2] === 'key' && diff.path[1] !== diff.rhs;
};

BlueprintDiffer.prototype._isColumnRemove = function(diff) {
  return diff.path[0] == 'columns' && diff.kind === 'D' && !diff.path[2];
};

BlueprintDiffer.prototype._isColumnUpdate = function(diff) {
  return diff.path[0] == 'columns' && diff.kind === 'E' && diff.path[2] && diff.path[2] !== 'key';
};

BlueprintDiffer.prototype._sortChanges = function(changes) {
  var rename = _.findWhere(changes, {type: 'blueprint.rename'});
  return _.sortBy(changes, function(change) {
    var weight = 0;
    if (change.type === 'column.rename')
      weight++;
    if (change.type === 'blueprint.rename')
      weight += 2;
    if (rename && change.blueprint === rename.value)
      weight += 3;
    return weight;
  });
};

BlueprintDiffer.prototype._invertChange = function(change) {
  switch (change.type) {
    case 'blueprint.create':
      return {
        type: 'blueprint.remove',
        blueprint: change.blueprint
      };
    case 'blueprint.rename':
      return {
        type: 'blueprint.rename',
        blueprint: change.value,
        value: change.blueprint
      };
    case 'blueprint.update':
      return {
        type: 'blueprint.update',
        blueprint: change.blueprint,
        key: change.key,
        value: change.oldValue,
        oldValue: change.value
      };
    case 'blueprint.remove':
      return {
        type: 'blueprint.create',
        blueprint: change.blueprint,
        value: change.oldValue
      };
    case 'column.create':
      return {
        type: 'column.remove',
        blueprint: change.blueprint,
        column: change.column
      };
    case 'column.rename':
      return {
        type: 'column.rename',
        blueprint: change.blueprint,
        column: change.value,
        value: change.column
      };
    case 'column.update':
      return {
        type: 'column.update',
        blueprint: change.blueprint,
        column: change.column,
        key: change.key,
        oldValue: change.value,
        value: change.oldValue
      };
    case 'column.remove':
      return {
        type: 'column.create',
        blueprint: change.blueprint,
        column: change.column,
        value: change.oldValue
      };
  }
};

module.exports = BlueprintDiffer;
