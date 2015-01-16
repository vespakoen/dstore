# node-projector

node-projector is a schema manager, and data projector.  
In practice, when we send a schema to it, and create a snapshot,  
It will create a postgresql database and elasticsearch index and create the necessary tables and mappings.  
Then, when we store an item, it will automatically serialize it appropiately and store it.  
In the future, we can use the schema information to transform items to newer / older versions of the schema.  

- elasticsearch
- postgresql
- leveldb

## ACTIONS

At this moment, the only way to communicate with node-projector is via a JSON API.  
The following commands are available

## get all schemas

**Retrieves all the schema definitions for a given namespace.**

*The namespace is an identifier for a project.*  
*Say you are making a blog and a homepage, you could use the namespaces: "blog" and "homepage"*

```shell
curl -X GET http://localhost:2000/api/schema/:namespace
```

## get schema

**Retrieves a single schema for a given namespace and schema key.**

*The schema key is a string that uniquely identifies your schema*  
*Coninuing from the previous blog example, the schemaKey could be a "post", "author" or a "comment"*

```shell
curl -X GET http://localhost:2000/api/schema/:namespace/:schemaKey
```

## put all schemas

**Stores all schemas for a given namespace.**

```shell
curl -X PUT http://localhost:2000/api/schema/:namespace -d '\
{\
  "article": {\
    "table": "articles",\
    "es_type": "article",\
    "columns": {\
      "title": {\
        "type": "text"\
      }\
    }\
  }\
}'
```

## put schema

**Stores a single schema for a given namespace and schema key.**

```shell
curl -X PUT http://localhost:2000/api/schema/:namespace/:schemaKey -d '\
{\
  "table": "articles",\
  "es_type": "article",\
  "columns": {\
    "title": {\
      "type": "string"\
    }\
  }\
}'
```

## create snapshot

**Stores the current schemas as a snapshot.**

*The "put schema' and "put all schemas" commands modify the "current" schema*  
*If you are happy with the schema, you create a snapshot which will give the schema a version number*  
*This will also trigger the migrations that will:*  

- create a postgresql database (named: namespace + 'v' + snapshotVersion)
- create database tables
- create an elasticsearch index (named: namespace + 'v' + snapshotVersion)
- put the elasticsearch mappings
- create or replace an alias from "namespace" to "namespace + 'v' + snapshotVersion"

```shell
curl -X POST http://localhost:2000/api/snapshot/:namespace
```

## put item

**Projects an item to all storage backends.**

```shell
curl -X PUT http://localhost:2000/api/item/:namespace/:schemaKey -d '\
{\
  "id": "66276124-ebcd-45e1-8013-825346daa283",\
  "version": 1,\
  "title": "Some title"\
}'
```

## del item

**Deletes an item in all storage backends.**

```shell
curl -X DELETE http://localhost:2000/api/item/:namespace/:schemaKey
```

# API DOCS

Head over to the [Api docs](http://trappsnl.github.io/node-projector) to learn more about the internals.
