var app = require('./main');

app.get('postgresql.migrator')
  .then(migrate);

function migrate (migrator) {
  migrator.migrate('projector', 1, {
    log: {
      table: 'log',
      columns: {
        namespace: {
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
        namespace: {
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
        namespace: {
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
