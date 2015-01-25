# Create a schema

```shell
curl -XPUT http://localhost:2020/api/schema/testnamespace/kitchensink -H 'content-type: application/json' -d '{
  "table": "kitchensinks",
  "elasticsearch_type": "kitchensink",
  "columns": {
    "type_integer": {
      "key": "integer_type",
      "type": "integer"
    },
    "type_uuid": {
      "key": "uuid_type",
      "type": "uuid"
    },
    "type_string": {
      "key": "string_type",
      "type": "string"
    },
    "type_text": {
      "key": "text_type",
      "type": "text"
    },
    "type_datetime": {
      "key": "datetime_type",
      "type": "datetime"
    },
    "type_date": {
      "key": "date_type",
      "type": "date"
    },
    "type_float": {
      "key": "float_type",
      "type": "float"
    },
    "type_point": {
      "key": "point_type",
      "type": "point"
    },
    "type_linestring": {
      "key": "linestring_type",
      "type": "linestring"
    },
    "type_polygon": {
      "key": "polygon_type",
      "type": "polygon"
    },
    "type_boolean": {
      "key": "boolean_type",
      "type": "boolean"
    },
    "type_json": {
      "key": "json_type",
      "type": "json"
    },
    "type_integer_array": {
      "type": "integer[]"
    },
    "type_uuid_array": {
      "type": "uuid[]"
    },
    "type_string_array": {
      "type": "string[]"
    },
    "type_text_array": {
      "type": "text[]"
    },
    "type_datetime_array": {
      "type": "datetime[]"
    },
    "type_date_array": {
      "type": "date[]"
    },
    "type_float_array": {
      "type": "float[]"
    },
    "type_point_array": {
      "type": "point[]"
    },
    "type_linestring_array": {
      "type": "linestring[]"
    },
    "type_polygon_array": {
      "type": "polygon[]"
    },
    "type_boolean_array": {
      "type": "boolean[]"
    },
    "type_json_array": {
      "type": "json[]"
    }
  }
}'
```

# Create a snapshot
```shell
curl -XPOST -H 'content-type: application/json' http://localhost:2020/api/snapshot/testnamespace
```

# Create an item
```shell
curl -XPUT -H 'content-type: application/json' http://localhost:2020/api/item/testnamespace/kitchensink -d '{
  "id": "a4f20ace-7aa4-4077-983b-717c2ec5427d",
  "snapshot_version": 1,
  "integer_type": 35235,
  "uuid_type": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
  "string_type": "some string",
  "text_type": "some text",
  "datetime_type": "05-06-2007 05:06:07",
  "date_type": "05-06-2007",
  "float_type": 22.22222222222222,
  "point_type": {
    "type": "Point",
    "coordinates": [
      5.9127083,
      50.78757
    ]
  },
  "linestring_type": {
    "type": "LineString",
    "coordinates": [
      [
        5.9127083,
        50.78757
      ],
      [
        5.9127083,
        50.78754
      ]
    ]
  },
  "polygon_type": {
    "type": "Polygon",
    "coordinates": [
      [
        [
          100,
          0
        ],
        [
          101,
          0
        ],
        [
          101,
          1
        ],
        [
          100,
          1
        ],
        [
          100,
          0
        ]
      ]
    ]
  },
  "boolean_type": true,
  "json_type": {
    "some": {
      "random": "json"
    }
  },
  "type_integer_array": [
    1,
    2,
    3
  ],
  "type_uuid_array": [
    "0c02a6b3-babd-4399-9105-42c40189bb89",
    "0cf7a1f2-800b-43ee-a4a1-838a76533108"
  ],
  "type_string_array": [
    "testing",
    "it",
    "out"
  ],
  "type_text_array": [
    "testing",
    "it",
    "out"
  ],
  "type_datetime_array": [
    "05-06-2007 05:06:07",
    "06-07-2008 06:07:08"
  ],
  "type_date_array": [
    "05-06-2007",
    "06-07-2008"
  ],
  "type_float_array": [
    22.2222,
    33.3333
  ],
  "type_point_array": {
    "type": "MultiPoint",
    "coordinates": [
      [
        5.9127083,
        50.78757
      ],
      [
        5.9127083,
        50.78757
      ]
    ]
  },
  "type_linestring_array": {
    "type": "MultiLineString",
    "coordinates": [
      [
        [
          100,
          0
        ],
        [
          101,
          1
        ]
      ],
      [
        [
          102,
          2
        ],
        [
          103,
          3
        ]
      ]
    ]
  },
  "type_polygon_array": {
    "type": "MultiPolygon",
    "coordinates": [
      [
        [
          [
            102,
            2
          ],
          [
            103,
            2
          ],
          [
            103,
            3
          ],
          [
            102,
            3
          ],
          [
            102,
            2
          ]
        ]
      ],
      [
        [
          [
            100,
            0
          ],
          [
            101,
            0
          ],
          [
            101,
            1
          ],
          [
            100,
            1
          ],
          [
            100,
            0
          ]
        ],
        [
          [
            100.2,
            0.2
          ],
          [
            100.8,
            0.2
          ],
          [
            100.8,
            0.8
          ],
          [
            100.2,
            0.8
          ],
          [
            100.2,
            0.2
          ]
        ]
      ]
    ]
  },
  "type_boolean_array": [
    true,
    false
  ],
  "type_json_array": [
    {
      "some": "data"
    },
    {
      "more": "data"
    }
  ],
  "links": [
    "e5c20ace-7aa4-4077-983b-717c2ec5427d"
  ]
}'
```

# PostgreSQL output
```shell
pg_dump testnamespacev1 --inserts
```

**output**
```sql
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

CREATE TABLE kitchensinks (
    id uuid NOT NULL,
    snapshot_version integer,
    type_integer integer,
    type_uuid uuid,
    type_string character varying(255),
    type_text text,
    type_datetime timestamp with time zone,
    type_date date,
    type_float real,
    type_point geometry(Point,4326),
    type_linestring geometry(LineString,4326),
    type_polygon geometry(Polygon,4326),
    type_boolean boolean,
    type_json json,
    type_integer_array integer[],
    type_uuid_array uuid[],
    type_string_array character varying[],
    type_text_array text[],
    type_datetime_array timestamp with time zone[],
    type_date_array date[],
    type_float_array real[],
    type_point_array geometry(MultiPoint,4326),
    type_linestring_array geometry(MultiLineString,4326),
    type_polygon_array geometry(MultiPolygon,4326),
    type_boolean_array boolean[],
    type_json_array json[],
    links uuid[]
);

INSERT INTO kitchensinks VALUES ('a4f20ace-7aa4-4077-983b-717c2ec5427d', 3, 35235, 'e5c20ace-7aa4-4077-983b-717c2ec5427d', 'some string', 'some text', '2007-05-06 05:06:07+02', '2007-05-06', 22.2222214, '0101000020E6100000AA262D019DA61740C6A70018CF644940', '0102000020E610000002000000AA262D019DA61740C6A70018CF644940AA262D019DA617405B25581CCE644940', '0103000020E6100000010000000500000000000000000059400000000000000000000000000040594000000000000000000000000000405940000000000000F03F0000000000005940000000000000F03F00000000000059400000000000000000', true, '{"some":{"random":"json"}}', '{1,2,3}', '{0c02a6b3-babd-4399-9105-42c40189bb89,0cf7a1f2-800b-43ee-a4a1-838a76533108}', '{testing,it,out}', '{testing,it,out}', '{"2007-05-06 05:06:07+02","2008-06-07 06:07:08+02"}', '{2007-05-06,2008-06-07}', '{22.2222004,33.3333015}', '0104000020E6100000020000000101000000AA262D019DA61740C6A70018CF6449400101000000AA262D019DA61740C6A70018CF644940', '0105000020E610000002000000010200000002000000000000000000594000000000000000000000000000405940000000000000F03F010200000002000000000000000080594000000000000000400000000000C059400000000000000840', '0106000020E61000000200000001030000000100000005000000000000000080594000000000000000400000000000C0594000000000000000400000000000C05940000000000000084000000000008059400000000000000840000000000080594000000000000000400103000000020000000500000000000000000059400000000000000000000000000040594000000000000000000000000000405940000000000000F03F0000000000005940000000000000F03F0000000000005940000000000000000005000000CDCCCCCCCC0C59409A9999999999C93F33333333333359409A9999999999C93F33333333333359409A9999999999E93FCDCCCCCCCC0C59409A9999999999E93FCDCCCCCCCC0C59409A9999999999C93F', '{t,f}', '{"{\"some\":\"data\"}","{\"more\":\"data\"}"}', '{e5c20ace-7aa4-4077-983b-717c2ec5427d}');

ALTER TABLE ONLY kitchensinks
    ADD CONSTRAINT kitchensinks_pkey PRIMARY KEY (id);
```

# Elasticsearch output
```shell
curl http://localhost:9200/testnamespacev1/_mapping?pretty=1
```

**output**
```json
{
  "testnamespacev1" : {
    "mappings" : {
      "kitchensink" : {
        "_id" : {
          "path" : "id"
        },
        "properties" : {
          "id" : {
            "type" : "string"
          },
          "links" : {
            "type" : "string"
          },
          "snapshot_version" : {
            "type" : "long"
          },
          "type_boolean" : {
            "type" : "boolean"
          },
          "type_boolean_array" : {
            "type" : "boolean"
          },
          "type_date" : {
            "type" : "date",
            "format" : "yyyy-MM-dd"
          },
          "type_date_array" : {
            "type" : "date",
            "format" : "yyyy-MM-dd"
          },
          "type_datetime" : {
            "type" : "date",
            "format" : "yyyy-MM-dd HH:mm:ss"
          },
          "type_datetime_array" : {
            "type" : "date",
            "format" : "yyyy-MM-dd HH:mm:ss"
          },
          "type_float" : {
            "type" : "float"
          },
          "type_float_array" : {
            "type" : "float"
          },
          "type_integer" : {
            "type" : "integer"
          },
          "type_integer_array" : {
            "type" : "integer"
          },
          "type_json" : {
            "type" : "object",
            "enabled" : false
          },
          "type_json_array" : {
            "type" : "object",
            "enabled" : false
          },
          "type_linestring" : {
            "type" : "geo_shape",
            "tree" : "quadtree",
            "tree_levels" : 23
          },
          "type_linestring_array" : {
            "type" : "geo_shape",
            "tree" : "quadtree",
            "tree_levels" : 23
          },
          "type_point" : {
            "type" : "geo_point"
          },
          "type_point_array" : {
            "type" : "geo_point"
          },
          "type_polygon" : {
            "type" : "geo_shape",
            "tree" : "quadtree",
            "tree_levels" : 23
          },
          "type_polygon_array" : {
            "type" : "geo_shape",
            "tree" : "quadtree",
            "tree_levels" : 23
          },
          "type_string" : {
            "type" : "string",
            "index" : "not_analyzed"
          },
          "type_string_array" : {
            "type" : "string",
            "index" : "not_analyzed"
          },
          "type_text" : {
            "type" : "string",
            "index" : "not_analyzed"
          },
          "type_text_array" : {
            "type" : "string",
            "index" : "not_analyzed"
          },
          "type_uuid" : {
            "type" : "string",
            "index" : "not_analyzed"
          },
          "type_uuid_array" : {
            "type" : "string",
            "index" : "not_analyzed"
          }
        }
      }
    }
  }
}
```

```shell
curl http://localhost:9200/testnamespacev1/_search?pretty=1
```

**output**
```json
{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 1,
    "hits": [
      {
        "_index": "testnamespacev1",
        "_type": "kitchensink",
        "_id": "a4f20ace-7aa4-4077-983b-717c2ec5427d",
        "_score": 1,
        "_source": {
          "id": "a4f20ace-7aa4-4077-983b-717c2ec5427d",
          "snapshot_version": 3,
          "type_integer": 35235,
          "type_uuid": "e5c20ace-7aa4-4077-983b-717c2ec5427d",
          "type_string": "some string",
          "type_text": "some text",
          "type_datetime": "2007-05-06 05:06:07",
          "type_date": "2007-05-06",
          "type_float": 22.222222222222,
          "type_point": [
            5.9127083,
            50.78757
          ],
          "type_linestring": {
            "type": "LineString",
            "coordinates": [
              [
                5.9127083,
                50.78757
              ],
              [
                5.9127083,
                50.78754
              ]
            ]
          },
          "type_polygon": {
            "type": "Polygon",
            "coordinates": [
              [
                [
                  100,
                  0
                ],
                [
                  101,
                  0
                ],
                [
                  101,
                  1
                ],
                [
                  100,
                  1
                ],
                [
                  100,
                  0
                ]
              ]
            ]
          },
          "type_boolean": true,
          "type_json": {
            "some": {
              "random": "json"
            }
          },
          "type_integer_array": [
            1,
            2,
            3
          ],
          "type_uuid_array": [
            "0c02a6b3-babd-4399-9105-42c40189bb89",
            "0cf7a1f2-800b-43ee-a4a1-838a76533108"
          ],
          "type_string_array": [
            "testing",
            "it",
            "out"
          ],
          "type_text_array": [
            "testing",
            "it",
            "out"
          ],
          "type_datetime_array": [
            "2007-05-06 05:06:07",
            "2008-06-07 06:07:08"
          ],
          "type_date_array": [
            "2007-05-06",
            "2008-06-07"
          ],
          "type_float_array": [
            22.2222,
            33.3333
          ],
          "type_point_array": [
            [
              5.9127083,
              50.78757
            ],
            [
              5.9127083,
              50.78757
            ]
          ],
          "type_linestring_array": {
            "type": "MultiLineString",
            "coordinates": [
              [
                [
                  100,
                  0
                ],
                [
                  101,
                  1
                ]
              ],
              [
                [
                  102,
                  2
                ],
                [
                  103,
                  3
                ]
              ]
            ]
          },
          "type_polygon_array": {
            "type": "MultiPolygon",
            "coordinates": [
              [
                [
                  [
                    102,
                    2
                  ],
                  [
                    103,
                    2
                  ],
                  [
                    103,
                    3
                  ],
                  [
                    102,
                    3
                  ],
                  [
                    102,
                    2
                  ]
                ]
              ],
              [
                [
                  [
                    100,
                    0
                  ],
                  [
                    101,
                    0
                  ],
                  [
                    101,
                    1
                  ],
                  [
                    100,
                    1
                  ],
                  [
                    100,
                    0
                  ]
                ],
                [
                  [
                    100.2,
                    0.2
                  ],
                  [
                    100.8,
                    0.2
                  ],
                  [
                    100.8,
                    0.8
                  ],
                  [
                    100.2,
                    0.8
                  ],
                  [
                    100.2,
                    0.2
                  ]
                ]
              ]
            ]
          },
          "type_boolean_array": [
            true,
            false
          ],
          "type_json_array": [
            {
              "some": "data"
            },
            {
              "more": "data"
            }
          ],
          "links": [
            "e5c20ace-7aa4-4077-983b-717c2ec5427d"
          ]
        }
      }
    ]
  }
}
```

# LevelDB output

```shell
superlevel storage/level/testnamespacev1/ createReadStream
```

**output**
```json
{"key":"!item-by-id!a4f20ace-7aa4-4077-983b-717c2ec5427d","value":"{\"id\":\"a4f20ace-7aa4-4077-983b-717c2ec5427d\",\"snapshot_version\":3,\"type_integer\":35235,\"type_uuid\":\"e5c20ace-7aa4-4077-983b-717c2ec5427d\",\"type_string\":\"some string\",\"type_text\":\"some text\",\"type_datetime\":\"2007-05-06 05:06:07\",\"type_date\":\"2007-05-06\",\"type_float\":22.22222222222222,\"type_point\":{\"type\":\"Point\",\"coordinates\":[5.9127083,50.78757]},\"type_linestring\":{\"type\":\"LineString\",\"coordinates\":[[5.9127083,50.78757],[5.9127083,50.78754]]},\"type_polygon\":{\"type\":\"Polygon\",\"coordinates\":[[[100,0],[101,0],[101,1],[100,1],[100,0]]]},\"type_boolean\":true,\"type_json\":{\"some\":{\"random\":\"json\"}},\"type_integer_array\":[1,2,3],\"type_uuid_array\":[\"0c02a6b3-babd-4399-9105-42c40189bb89\",\"0cf7a1f2-800b-43ee-a4a1-838a76533108\"],\"type_string_array\":[\"testing\",\"it\",\"out\"],\"type_text_array\":[\"testing\",\"it\",\"out\"],\"type_datetime_array\":[\"2007-05-06 05:06:07\",\"2008-06-07 06:07:08\"],\"type_date_array\":[\"2007-05-06\",\"2008-06-07\"],\"type_float_array\":[22.2222,33.3333],\"type_point_array\":{\"type\":\"MultiPoint\",\"coordinates\":[[5.9127083,50.78757],[5.9127083,50.78757]]},\"type_linestring_array\":{\"type\":\"MultiLineString\",\"coordinates\":[[[100,0],[101,1]],[[102,2],[103,3]]]},\"type_polygon_array\":{\"type\":\"MultiPolygon\",\"coordinates\":[[[[102,2],[103,2],[103,3],[102,3],[102,2]]],[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]]},\"type_boolean_array\":[true,false],\"type_json_array\":[{\"some\":\"data\"},{\"more\":\"data\"}],\"links\":[\"e5c20ace-7aa4-4077-983b-717c2ec5427d\"]}"}
{"key":"!item-by-type#kitchensink!a4f20ace-7aa4-4077-983b-717c2ec5427d","value":"{\"id\":\"a4f20ace-7aa4-4077-983b-717c2ec5427d\",\"snapshot_version\":3,\"type_integer\":35235,\"type_uuid\":\"e5c20ace-7aa4-4077-983b-717c2ec5427d\",\"type_string\":\"some string\",\"type_text\":\"some text\",\"type_datetime\":\"2007-05-06 05:06:07\",\"type_date\":\"2007-05-06\",\"type_float\":22.22222222222222,\"type_point\":{\"type\":\"Point\",\"coordinates\":[5.9127083,50.78757]},\"type_linestring\":{\"type\":\"LineString\",\"coordinates\":[[5.9127083,50.78757],[5.9127083,50.78754]]},\"type_polygon\":{\"type\":\"Polygon\",\"coordinates\":[[[100,0],[101,0],[101,1],[100,1],[100,0]]]},\"type_boolean\":true,\"type_json\":{\"some\":{\"random\":\"json\"}},\"type_integer_array\":[1,2,3],\"type_uuid_array\":[\"0c02a6b3-babd-4399-9105-42c40189bb89\",\"0cf7a1f2-800b-43ee-a4a1-838a76533108\"],\"type_string_array\":[\"testing\",\"it\",\"out\"],\"type_text_array\":[\"testing\",\"it\",\"out\"],\"type_datetime_array\":[\"2007-05-06 05:06:07\",\"2008-06-07 06:07:08\"],\"type_date_array\":[\"2007-05-06\",\"2008-06-07\"],\"type_float_array\":[22.2222,33.3333],\"type_point_array\":{\"type\":\"MultiPoint\",\"coordinates\":[[5.9127083,50.78757],[5.9127083,50.78757]]},\"type_linestring_array\":{\"type\":\"MultiLineString\",\"coordinates\":[[[100,0],[101,1]],[[102,2],[103,3]]]},\"type_polygon_array\":{\"type\":\"MultiPolygon\",\"coordinates\":[[[[102,2],[103,2],[103,3],[102,3],[102,2]]],[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]]},\"type_boolean_array\":[true,false],\"type_json_array\":[{\"some\":\"data\"},{\"more\":\"data\"}],\"links\":[\"e5c20ace-7aa4-4077-983b-717c2ec5427d\"]}"}
{"key":"!item-by-type-and-id!kitchensink,a4f20ace-7aa4-4077-983b-717c2ec5427d","value":"{\"id\":\"a4f20ace-7aa4-4077-983b-717c2ec5427d\",\"snapshot_version\":3,\"type_integer\":35235,\"type_uuid\":\"e5c20ace-7aa4-4077-983b-717c2ec5427d\",\"type_string\":\"some string\",\"type_text\":\"some text\",\"type_datetime\":\"2007-05-06 05:06:07\",\"type_date\":\"2007-05-06\",\"type_float\":22.22222222222222,\"type_point\":{\"type\":\"Point\",\"coordinates\":[5.9127083,50.78757]},\"type_linestring\":{\"type\":\"LineString\",\"coordinates\":[[5.9127083,50.78757],[5.9127083,50.78754]]},\"type_polygon\":{\"type\":\"Polygon\",\"coordinates\":[[[100,0],[101,0],[101,1],[100,1],[100,0]]]},\"type_boolean\":true,\"type_json\":{\"some\":{\"random\":\"json\"}},\"type_integer_array\":[1,2,3],\"type_uuid_array\":[\"0c02a6b3-babd-4399-9105-42c40189bb89\",\"0cf7a1f2-800b-43ee-a4a1-838a76533108\"],\"type_string_array\":[\"testing\",\"it\",\"out\"],\"type_text_array\":[\"testing\",\"it\",\"out\"],\"type_datetime_array\":[\"2007-05-06 05:06:07\",\"2008-06-07 06:07:08\"],\"type_date_array\":[\"2007-05-06\",\"2008-06-07\"],\"type_float_array\":[22.2222,33.3333],\"type_point_array\":{\"type\":\"MultiPoint\",\"coordinates\":[[5.9127083,50.78757],[5.9127083,50.78757]]},\"type_linestring_array\":{\"type\":\"MultiLineString\",\"coordinates\":[[[100,0],[101,1]],[[102,2],[103,3]]]},\"type_polygon_array\":{\"type\":\"MultiPolygon\",\"coordinates\":[[[[102,2],[103,2],[103,3],[102,3],[102,2]]],[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]]},\"type_boolean_array\":[true,false],\"type_json_array\":[{\"some\":\"data\"},{\"more\":\"data\"}],\"links\":[\"e5c20ace-7aa4-4077-983b-717c2ec5427d\"]}"}
{"key":"!type-by-id!a4f20ace-7aa4-4077-983b-717c2ec5427d","value":"kitchensink"}
```
