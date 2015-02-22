var app = require('./main');

app.get('postgresql.migrator')
  .then(migrate);

function migrate (migrator) {
  migrator.migrate('dstore', 1, {
    log: {
      table: 'log',
      columns: {
        project_id: {
          type: 'string'
        },
        log: {
          type: 'json[]'
        }
      }
    },
    versions: {
      table: 'versions',
      columns: {
        project_id: {
          type: 'string'
        },
        version: {
          type: 'string'
        }
      }
    },
    snapshots: {
      table: 'snapshots',
      columns: {
        project_id: {
          type: 'string'
        },
        version: {
          type: 'string'
        },
        blueprints: {
          type: 'json'
        }
      }
    }
  })
  .then(function (result) {
    console.log(result);
  })
  .catch(function (err) {
    console.error(err);
  });
}
