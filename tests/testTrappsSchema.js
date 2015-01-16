'use strict';

process.env.ENV = 'testing';
var app = require('../bootstrap');
var Promise = require('bluebird');
var rmRF = Promise.promisify(require('rimraf'));
var exec = require('child-process-promise').exec;
var pg = require('pg');
Promise.promisifyAll(pg);

var memo = {};

function wait () {
  return new Promise(function (resolve) {
    setTimeout(resolve, 4000);
  });
}

app.get('queue')
  .then(function (queue) {
    memo.queue = queue;
    return rmRF(__dirname + '/../storage/schema/trapps');
  })
  .then(function () {
    return rmRF(__dirname + '/../storage/level');
  })
  .then(function () {
    return exec('curl -XDELETE http://localhost:9200/_all');
  })
  .then(function () {
    var connectionString = 'postgresql://trapps:trapps@localhost/postgres';
    return pg.connectAsync(connectionString)
      .spread(function(client, done) {
        return Promise.join(
          client.queryAsync('DROP DATABASE trappsv1'),
          client.queryAsync('DROP DATABASE trappsv2')
        )
        .catch(function () {
          console.log('drop db', arguments);
        });
      });
  })
  .then(function () {
    return memo.queue.publish('put-all-schemas', {
      namespace: 'trapps',
      schemas: {
        news: {
          table: "news",
          es_type: "news",
          columns: {
            content_nl: {
              type: "text"
            },
            content_en: {
              type: "text"
            },
            content_de: {
              type: "text"
            },
            content_fr: {
              type: "text"
            },
            content_no: {
              type: "text"
            },
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              },
              rules: [{type: 'isDate'}]
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              },
              rules: [{type: 'isDate'}]
            },
            description_nl: {
              type: "string"
            },
            description_en: {
              type: "string"
            },
            description_de: {
              type: "string"
            },
            description_fr: {
              type: "string"
            },
            description_no: {
              type: "string"
            },
            image: {
              type: "string"
            },
            image_list_highres: {
              type: "string"
            },
            image_lowres: {
              type: "string"
            },
            title_nl: {
              // key: "nl_title",
              type: "string"
            },
            title_en: {
              // key: "en_title",
              type: "string"
            },
            title_de: {
              // key: "de_title",
              type: "string"
            },
            title_fr: {
              // key: "fr_title",
              type: "string"
            },
            title_no: {
              // key: "no_title",
              type: "string"
            },
            weight: {
              type: "float"
            }
          }
        },
        "pointofinterest-category": {
          table: "pointofinterestcategories",
          es_type: "pointofinterest-category",
          columns: {
            title_nl: {
              type: "string"
            },
            title_en: {
              type: "string"
            },
            title_de: {
              type: "string"
            },
            title_fr: {
              type: "string"
            },
            title_no: {
              type: "string"
            },
            image: {
              type: "string"
            },
            image_list: {
              type: "string"
            },
            weight: {
              type: "float"
            },
            date_changed: {
              type: "datetime"
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            }
          }
        },
        geopoint: {
          table: "geopoints",
          es_type: "geopoint",
          columns: {
            city: {
              type: "string"
            },
            content_nl: {
              type: "text"
            },
            content_en: {
              type: "text"
            },
            content_de: {
              type: "text"
            },
            content_fr: {
              type: "text"
            },
            content_no: {
              type: "text"
            },
            website_nl: {
              type: "string"
            },
            website_en: {
              type: "string"
            },
            website_de: {
              type: "string"
            },
            website_fr: {
              type: "string"
            },
            website_no: {
              type: "string"
            },
            country: {
              type: "string"
            },
            address: {
              type: "string"
            },
            zipcode: {
              type: "string"
            },
            phonenumber: {
              type: "string"
            },
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            description_nl: {
              type: "string"
            },
            description_en: {
              type: "string"
            },
            description_de: {
              type: "string"
            },
            description_fr: {
              type: "string"
            },
            description_no: {
              type: "string"
            },
            image: {
              type: "string"
            },
            image_lowres: {
              type: "string"
            },
            image_list: {
              type: "string"
            },
            image_list_highres: {
              type: "string"
            },
            pin: {
              type: "point",
              elasticsearch: {
                type: "geo_point"
              }
            },
            title_nl: {
              type: "string"
            },
            title_en: {
              type: "string"
            },
            title_de: {
              type: "string"
            },
            title_fr: {
              type: "string"
            },
            title_no: {
              type: "string"
            }
          }
        },
        "news-category": {
          table: "newscategories",
          es_type: "news-category",
          columns: {
            image: {
              type: "string"
            },
            image_list: {
              type: "string"
            },
            title_nl: {
              type: "string"
            },
            title_en: {
              type: "string"
            },
            title_de: {
              type: "string"
            },
            title_fr: {
              type: "string"
            },
            title_no: {
              type: "string"
            },
            weight: {
              type: "float"
            },
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            }
          }
        },
        feature: {
          table: "features",
          es_type: "feature",
          columns: {
            content_nl: {
              type: "text"
            },
            content_en: {
              type: "text"
            },
            content_de: {
              type: "text"
            },
            content_fr: {
              type: "text"
            },
            content_no: {
              type: "text"
            },
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            icon: {
              type: "string"
            },
            image_screenshot_android: {
              type: "string"
            },
            image_screenshot_ios: {
              type: "string"
            },
            title_nl: {
              type: "string"
            },
            title_en: {
              type: "string"
            },
            title_de: {
              type: "string"
            },
            title_fr: {
              type: "string"
            },
            title_no: {
              type: "string"
            }
          }
        },
        pointofinterest: {
          table: "pointsofinterest",
          es_type: "pointofinterest",
          columns: {
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            pin: {
              type: "point",
              elasticsearch: {
                type: "geo_point"
              }
            }
          }
        },
        "geopoint-category": {
          table: "geopointcategories",
          es_type: "geopoint-category",
          columns: {
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            }
          }
        },
        "compo-event": {
          table: "compoevents",
          es_type: "compo-event",
          columns: {
            date_end: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_start: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            pin: {
              type: "point",
              elasticsearch: {
                type: "geo_point"
              }
            }
          }
        },
        advertisement: {
          table: "advertisements",
          es_type: "advertisement",
          columns: {
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            }
          }
        },
        startingpoint: {
          table: "startingpoints",
          es_type: "startingpoint",
          columns: {
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            pin: {
              type: "point",
              elasticsearch: {
                type: "geo_point"
              }
            }
          }
        },
        compilation: {
          table: "compilations",
          es_type: "compilation",
          columns: {
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            pin: {
              type: "point",
              elasticsearch: {
                type: "geo_point"
              }
            }
          }
        },
        screen: {
          table: "screens",
          es_type: "screen",
          columns: {
            auto_relate: {
              type: "string"
            },
            content_nl: {
              type: "text"
            },
            content_en: {
              type: "text"
            },
            content_de: {
              type: "text"
            },
            content_fr: {
              type: "text"
            },
            content_no: {
              type: "text"
            },
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            description_nl: {
              type: "string"
            },
            description_en: {
              type: "string"
            },
            description_de: {
              type: "string"
            },
            description_fr: {
              type: "string"
            },
            description_no: {
              type: "string"
            },
            image: {
              type: "string"
            },
            image_icon_ios: {
              type: "string"
            },
            image_list_highres: {
              type: "string"
            },
            image_lowres: {
              type: "string"
            },
            listing_only: {
              type: "boolean"
            },
            menu_label_nl: {
              type: "string"
            },
            menu_label_en: {
              type: "string"
            },
            menu_label_de: {
              type: "string"
            },
            menu_label_fr: {
              type: "string"
            },
            menu_label_no: {
              type: "string"
            },
            show_in_menu: {
              type: "boolean"
            },
            title_nl: {
              type: "string"
            },
            title_en: {
              type: "string"
            },
            title_de: {
              type: "string"
            },
            title_fr: {
              type: "string"
            },
            title_no: {
              type: "string"
            },
            weight: {
              type: "float"
            }
          }
        },
        company: {
          table: "companys",
          es_type: "company",
          columns: {
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            pin: {
              type: "point",
              elasticsearch: {
                type: "geo_point"
              }
            }
          }
        },
        tabscreen: {
          table: "tabscreens",
          es_type: "tabscreen",
          columns: {
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            }
          }
        },
        message: {
          table: "messages",
          es_type: "message",
          columns: {
            title_nl: {
              type: "string"
            },
            title_en: {
              type: "string"
            },
            title_de: {
              type: "string"
            },
            title_fr: {
              type: "string"
            },
            title_no: {
              type: "string"
            },
            content_nl: {
              type: "string"
            },
            content_en: {
              type: "string"
            },
            content_de: {
              type: "string"
            },
            content_fr: {
              type: "string"
            },
            content_no: {
              type: "string"
            },
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            }
          }
        },
        app: {
          table: "apps",
          es_type: "app",
          columns: {
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            namespace: {
              type: "string",
              elasticsearch: {
                index: "not_analyzed",
                store:true
              }
            }
          }
        },
        trail: {
          table: "trails",
          es_type: "trail",
          columns: {
            title_nl: {
              type: "string"
            },
            title_en: {
              type: "string"
            },
            title_de: {
              type: "string"
            },
            title_fr: {
              type: "string"
            },
            title_no: {
              type: "string"
            },
            description_nl: {
              type: "string"
            },
            description_en: {
              type: "string"
            },
            description_de: {
              type: "string"
            },
            description_fr: {
              type: "string"
            },
            description_no: {
              type: "string"
            },
            content_nl: {
              type: "text"
            },
            content_en: {
              type: "text"
            },
            content_de: {
              type: "text"
            },
            content_fr: {
              type: "text"
            },
            content_no: {
              type: "text"
            },
            image: {
              type: "string"
            },
            image_list_highres: {
              type: "string"
            },
            image_lowres: {
              type: "string"
            },
            trail: {
              type: "linestring",
              elasticsearch: {
                type: "geo_shape",
                tree: "quadtree",
                tree_levels:23
              }
            },
            map_checksum: {
              type: "string"
            },
            map_url: {
              type: "string"
            },
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            }
          }
        },
        direction: {
          table: "directions",
          es_type: "direction",
          columns: {
            date_changed: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            date_created: {
              type: "datetime",
              elasticsearch: {
                format: "yyyy-MM-dd HH:mm:ss"
              }
            },
            image: {
              type: "string"
            },
            image_highres: {
              type: "string"
            },
            image_list_highres: {
              type: "string"
            },
            image_lowres: {
              type: "string"
            },
            pin: {
              type: "point",
              elasticsearch: {
                type: "geo_point"
              }
            },
            title_nl: {
              type: "string"
            },
            title_en: {
              type: "string"
            },
            title_de: {
              type: "string"
            },
            title_fr: {
              type: "string"
            },
            title_no: {
              type: "string"
            }
          }
        }
      }
    });
  })
  .then(function () {
    return memo.queue.publish('create-snapshot', {
      namespace: 'trapps'
    });
  })
  .then(function () {
    return memo.queue.publish('put-item', {
      namespace: 'trapps',
      key: 'news',
      item: {
        id: '887d2f1c-2a0c-490b-9020-6bddcbc85130',
        version: 1,
        title_nl: 'Hello',
        date_created: '2014-12-12 00:00:00',
        date_changed: '2014-12-12 00:00:00'
      }
    });
  })
  .then(function () {
    return memo.queue.publish('put-schema', {
      namespace: 'trapps',
      key: 'news',
      schema: {
        table: "news",
        es_type: "news",
        columns: {
          content_nl: {
            type: "text"
          },
          content_en: {
            type: "text"
          },
          content_de: {
            type: "text"
          },
          content_fr: {
            type: "text"
          },
          content_no: {
            type: "text"
          },
          date_changed: {
            type: "datetime",
            elasticsearch: {
              format: "yyyy-MM-dd HH:mm:ss"
            }
          },
          date_created: {
            type: "datetime",
            elasticsearch: {
              format: "yyyy-MM-dd HH:mm:ss"
            }
          },
          description_nl: {
            type: "string"
          },
          description_en: {
            type: "string"
          },
          description_de: {
            type: "string"
          },
          description_fr: {
            type: "string"
          },
          description_no: {
            type: "string"
          },
          image: {
            type: "string"
          },
          image_list_highres: {
            type: "string"
          },
          image_lowres: {
            type: "string"
          },
          title_nl: {
            key: "nl_title",
            type: "string"
          },
          title_en: {
            key: "en_title",
            type: "string"
          },
          title_de: {
            key: "de_title",
            type: "string"
          },
          title_fr: {
            key: "fr_title",
            type: "string"
          },
          title_no: {
            key: "no_title",
            type: "string"
          },
          weight: {
            type: "float"
          }
        }
      }
    });
  })
  .then(function () {
    return memo.queue.publish('create-snapshot', {
      namespace: 'trapps'
    });
  })
  .then(function () {
    return memo.queue.publish('put-item', {
      namespace: 'trapps',
      key: 'news',
      item: {
        id: '887d2f1c-2a0c-490b-9020-6bddcbc85130',
        version: 2,
        nl_title: 'Hello world',
        date_created: '2014-12-12 00:00:00',
        date_changed: '2014-12-12 00:00:00'
      }
    });
  })
  .then(wait)
  .then(function () {
    return memo.queue.publish('put-item', {
      namespace: 'trapps',
      key: 'news',
      item: {
        id: '887d2f1c-2a0c-490b-9020-6bddcbc85130',
        version: 1,
        title_nl: 'Hello world!',
        date_created: '2014-12-12',
        date_changed: '2014-12-12'
      }
    });
  });
