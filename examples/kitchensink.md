# Create a schema

```shell
curl -XPUT http://localhost:2000/api/schema/testnamespace/kitchensink -H 'content-type: application/json' -d '{
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
curl -XPOST -H 'content-type: application/json' http://localhost:2000/api/snapshot/testnamespace
```

# Create an item
```shell
curl -XPUT -H 'content-type: application/json' http://localhost:2000/api/item/testnamespace/kitchensink -d '{
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
