[![build status](https://travis-ci.org/trappsnl/dstore.svg)](https://travis-ci.org/trappsnl/dstore)
[![Code Climate](https://codeclimate.com/github/trappsnl/dstore/badges/gpa.svg)](https://codeclimate.com/github/trappsnl/dstore)

[![NPM](https://nodei.co/npm/dstore.png?downloads=true)](https://nodei.co/npm/dstore/)

# Introduction

dstore is an interface for different storage formats and databases (let's call them **datastores** from now on).  
It takes 1 kind of input, and translates this into the correct format for every storage engine.  

Besides abstracting away the input format, dstore also provides a single notation for your data's schema (called **blueprints**).  

Blueprints tell dstore what your data looks like.

This is used for:

* Validation of the input when storing items (via json schema).
    * **json schema** http://spacetelescope.github.io/understanding-json-schema/
    * **built-in schemas** https://github.com/trappsnl/dstore/tree/master/schemas
* Serialization of the input when sending the item to a specific store.
* Creation of the PostgreSQL tables / creation of the Elasticsearch mappings.
* Transforming of items to make it compatible with blueprints of different versions.

dstore also tracks the changes you make to your blueprints.  
By knowing what has changed, it is able to make the data compatible with older and never versions of your project.  
This means old clients will still receive the latest data, and data that gets inserted by older clients is still available to new clients (although maybe lacking some "columns" in the data, in case new columns were added).  

Currently, dstore supports **PostgreSQL**, **Elasticsearch** and **LevelDB**, a great stack for a modern web application.  


# Overview

![overview](http://trappsnl.github.io/dstore/overview.png)


# Topics

- [Projects](#projects)
- [Blueprints](#blueprints)
- [Items](#items)
- [API](#api)
- [Requirements](#requirements)
- [Installation](#installation)
- [Dive deeper](#dive-deeper)

# Projects

Projects are similar to a "database" or an "elasticsearch index", 
In case of dstore, a project is nothing more than an identifier under which we store blueprints and version information.
A good identifier for your project is a [reverse-DNS](http://en.wikipedia.org/wiki/Reverse_domain_name_notation)  
or a simple string like "blog" or "website"

# Blueprints

The blueprint describes your data format, so the stores know what data they can expect and know how to serialize it.  
A blueprint contains information like the table name, elasticsearch type, the columns and the validation options that should be used when data is stored.  
Let's look at an example how to create a blueprint for storing posts for a blog.
For this, we use **Put blueprint** command, and use "myblog" as the project identifier, and "article" as the blueprint identifier.

```shell
curl -X PUT http://localhost:2020/myblog/article/_blueprint -d '
{
  "postgresql": {
    "table": "articles"
  },
  "elasticsearch": {
    "type": "article"
  },
  "columns": {
    "title_nl": {
      "type": "string"
    },
    "title_en": {
      "type": "string"
    },
    "intro_nl": {
      "type": "text"
    },
    "intro_en": {
      "type": "text"
    },
    "content_nl": {
      "type": "text"
    },
    "content_en": {
      "type": "text"
    },
    "date_created": {
      "type": "datetime",
      "validation": {
        "required": true
      }
    },
    "date_changed": {
      "type": "datetime",
      "validation": {
        "required": true
      }
    }
  }
}'
```

This command created a "myblog" project, containing a "article" blueprint.
All we have to do next is tag the "myblog" project to make it ready for accepting data.
But first, take a look at the **column types** that dstore supports and what they translate to for the different datastores.

<table>
  <tr>
    <th>column type</th>
    <th>postgresql type</th>
    <th>elasticsearch type</th>
    <th>leveldb type</th>
  </tr>
  <tr>
    <th>uuid</th>
    <td>UUID</td>
    <td>string</td>
    <td>String (JSON)</td>
  </tr>
  <tr>
    <th>uuid[]</th>
    <td>UUID[]</td>
    <td>string</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>string</th>
    <td>STRING</td>
    <td>string</td>
    <td>String (JSON)</td>
  </tr>
  <tr>
    <th>string[]</th>
    <td>STRING[]</td>
    <td>string</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>text</th>
    <td>TEXT</td>
    <td>text</td>
    <td>String (JSON)</td>
  </tr>
  <tr>
    <th>text[]</th>
    <td>TEXT[]</td>
    <td>text</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>point</th>
    <td>GEOMETRY(Point, 4326)</td>
    <td>geo_point</td>
    <td>Object (GeoJSON)</td>
  </tr>
  <tr>
    <th>point[]</th>
    <td>GEOMETRY(MultiPoint, 4326)</td>
    <td>geo_point</td>
    <td>Object (GeoJSON)</td>
  </tr>
  <tr>
    <th>linestring</th>
    <td>GEOMETRY(LineString, 4326)</td>
    <td>geo_shape</td>
    <td>Object (GeoJSON)</td>
  </tr>
  <tr>
    <th>linestring[]</th>
    <td>GEOMETRY(MultiLineString, 4326)</td>
    <td>geo_shape</td>
    <td>Object (GeoJSON)</td>
  </tr>
  <tr>
    <th>polygon</th>
    <td>GEOMETRY(Polygon, 4326)</td>
    <td>geo_shape</td>
    <td>Object (GeoJSON)</td>
  </tr>
  <tr>
    <th>polygon[]</th>
    <td>GEOMETRY(MultiPolygon, 4326)</td>
    <td>geo_shape</td>
    <td>Object (GeoJSON)</td>
  </tr>
  <tr>
    <th>date</th>
    <td>DATE</td>
    <td>date (format: yyyy-MM-dd)</td>
    <td>String (JSON)</td>
  </tr>
  <tr>
    <th>date[]</th>
    <td>DATE[]</td>
    <td>date (format: yyyy-MM-dd)</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>datetime</th>
    <td>TIMESTAMP WITH TIMEZONE</td>
    <td>date (format: yyyy-MM-dd HH:mm:ss)</td>
    <td>String (JSON)</td>
  </tr>
  <tr>
    <th>datetime[]</th>
    <td>TIMESTAMP WITH TIMEZONE[]</td>
    <td>date (format: yyyy-MM-dd HH:mm:ss)</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>float</th>
    <td>REAL</td>
    <td>float</td>
    <td>Number (JSON)</td>
  </tr>
  <tr>
    <th>float[]</th>
    <td>REAL[]</td>
    <td>float</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>integer</th>
    <td>INTEGER</td>
    <td>integer</td>
    <td>Number (JSON)</td>
  </tr>
  <tr>
    <th>integer[]</th>
    <td>INTEGER[]</td>
    <td>integer</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>boolean</th>
    <td>BOOLEAN</td>
    <td>boolean</td>
    <td>Boolean (JSON)</td>
  </tr>
  <tr>
    <th>boolean[]</th>
    <td>BOOLEAN[]</td>
    <td>boolean</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>json</th>
    <td>JSON</td>
    <td>object</td>
    <td>Object (JSON)</td>
  </tr>
  <tr>
    <th>json[]</th>
    <td>JSON[]</td>
    <td>object</td>
    <td>Array (JSON)</td>
  </tr>
</table>

As you can see, we follow PostgreSQL's [] notation for defining *an array* of something.

# Versions

When you are done adding blueprints to a project, it's time to create a project tag.
By creating a tag we are saving the current state of all blueprints, and assign a tag version number to it.
The migrators for every store will kick into action to prepare themselves for accepting data in this new format.  
In practice, this means that a new database and elasticsearch index is created with it's name being a combination of your project's identifier, a "v" and the tagged version. (e.g. myblogv1, myblogv2 etc...).  
For LevelDB, it's quite easy. Since it's schemaless we don't have to migrate anything.

You can create a tag with the **Tag project** command:

```shell
curl -X POST http://localhost:2020/myblog/_version
```

When the request completes, the storage engines are ready to handle data with the new blueprint.


# Items

Storing items is done via a simple PUT command.
The request body is JSON and should, at the very least contain the following keys:

- **project_version** An existing project tag
- **id** A UUID that does or does not yet exist in the database

You can also include a **links** key that is an array of UUID's, pointing to other items  
*Internally (and above), we refer to data as an "item", this is the same concept as a elasticsearch document or a table row.*

Below is an example:
```shell
curl -X PUT http://localhost:2020/myblog/article/66276124-ebcd-45e1-8013-825346daa283 -d '
{
  "id": "66276124-ebcd-45e1-8013-825346daa283",
  "project_version": 1,
  "title_nl": "De titel",
  "title_en": "Some title",
  "intro_nl": "De intro",
  "intro_en": "The intro",
  "content_nl": "De inhoud",
  "content_en": "The content",
  "date_created": "2014-01-17 03:50:12",
  "date_changed": "2014-01-17 03:50:12"
}'
```

Deleting an item is not so difficult either:
```shell
curl -X DELETE http://localhost:2020/myblog/article/66276124-ebcd-45e1-8013-825346daa283
```

# API

At this moment, the only way to communicate with dstore is via a JSON API.  
We are looking to add more ways of communicating with dstore in the future.

Check the [API documentation](http://docs.dstore.apiary.io/) over at apiary.io for a full overview of possibilities to manage and retrieve information about projects, blueprints and version.

# Requirements

- [Node.js](http://nodejs.org/)
- [RabbitMQ](https://www.rabbitmq.com)
- [PostgreSQL](http://www.postgresql.org)
- [PostgreSQL contrib modules](http://www.postgresql.org/docs/9.3/static/uuid-ossp.html) (for UUID support)
- [Postgis](http://www.postgis.net) (for spatial support)
- A "template_postgis" [template](http://www.postgresql.org/docs/9.3/static/sql-createdatabase.html) with uuid and/or postgis support
- A PostgreSQL user with premissions for creating databases
- [Elasticsearch](http://www.elasticsearch.org/)

To run the script, you must make the following environment variables available.

```shell
export POSTGRESQL_HOST="localhost"
export POSTGRESQL_PORT="5432"
export POSTGRESQL_USER="..."
export POSTGRESQL_PASSWORD="..."
export ELASTICSEARCH_HOST="http://localhost:9200"
export QUEUE_CLIENT="kue"
export PROJECTOR_PATH=`pwd`
export LEVEL_PATH="$PROJECTOR_PATH/storage/level"
export PROJECT_FILE_PATH="$PROJECTOR_PATH/storage/blueprint"
export STORES=postgresql,elasticsearch,level
export PORT=2020
```

# Installation

We build a .deb file that installs dstore on your system.
It is made & tested on Ubuntu 14.04, but probably works in debian as well.
It will go through all the instructions as seen in [DIY](#diy).

## Vagrant
```shell
git clone https://github.com/trappsnl/dstore.git
cd dstore
vagrant up
```

## Apt

### Install dependencies
```shell
echo "==> Grab elasticsearch key"
wget -qO - https://packages.elasticsearch.org/GPG-KEY-elasticsearch | sudo apt-key add -

echo "==> Add elasticsearch repository"
sudo add-apt-repository -y "deb http://packages.elasticsearch.org/elasticsearch/1.4/debian stable main"

echo "==> Installing dependencies"
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs build-essential openjdk-7-jdk htop elasticsearch rabbitmq-server postgresql postgresql-contrib postgresql-9.3-postgis-2.1

echo "==> Starting elasticsearch on startup"
sudo update-rc.d elasticsearch defaults 95 10

echo "==> Starting elasticsearch"
sudo service elasticsearch start
```

### Install dstore

```shell
echo "==> Grab dstore .deb"
wget https://github.com/trappsnl/dstore/raw/master/build/debinstall/dstore-1.deb

echo "Installing deb"
sudo dpkg -i dstore-1.deb

echo "==> Running apt-get -f install (enter new postgresql credentials for dstore during installation)"
sudo apt-get -f -y install

echo "==> Starting dstore on startup"
sudo update-rc.d dstore defaults 96 11

echo "==> Starting dstore"
sudo service dstore start
```

## DIY

Follow all the steps from the **Install dependencies** section, after that:

```shell
# install dstore
npm install --save dstore

# install PM2 (node.js process manager)
sudo npm install -g pm2

# change user to postgres
sudo su postgres

# create postgresql database
createdb -E UTF8 -T template0 template_postgis

# create postgis template for postgresql (only if you need spatial support)
# REPLACE THE USERNAME AND PASSWORD WITH THE ONE OF YOUR LIKINGS
psql template_postgis <<EOF
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION postgis;
UPDATE pg_database SET datistemplate = TRUE WHERE datname = 'template_postgis';
CREATE USER name_of_your_dstore_postgresql_user WITH PASSWORD 'your_very_own_password';
ALTER USER name_of_your_dstore_postgresql_user CREATEDB;
EOF

# export necessary config variables
# REPLACE THE USERNAME AND PASSWORD WITH THE ONES YOU CHOSE IN THE PREVIOUS STEP
export POSTGRESQL_HOST="localhost"
export POSTGRESQL_PORT="5432"
export POSTGRESQL_USER="..."
export POSTGRESQL_PASSWORD="..."
export ELASTICSEARCH_HOST="http://localhost:9200"
export QUEUE_CLIENT="kue"
export PROJECTOR_PATH=`pwd`
export LEVEL_PATH="$PROJECTOR_PATH/storage/level"
export PROJECT_FILE_PATH="$PROJECTOR_PATH/storage/blueprint"
export STORES=postgresql,elasticsearch,level
export PORT=2020

# start dstore
./path/to/dstore/bin/start.sh
```

#Dive deeper
Head over to the [Api docs](http://trappsnl.github.io/dstore) to learn more about the internals.
