FORMAT: 1A

# dstore
Welcome to the API docs for dstore.  

For your (and our) convenience, our API uses some of the same conventions as elasticsearch does.  

The similarities are:

* The `project_id` always comes first, like elasticsearch's `index`.  
* The `blueprint_id` can optionally be added as the second argument, like elasticsearch's `type`

* Blueprints are namespaced with `_blueprint`, like elasticsearch's `_mapping`  
    * **get blueprint**  
      `GET /{project_id}/{blueprint_id}/_blueprint`
    * **update blueprint**  
      `PUT /{project_id}/{blueprint_id}/_blueprint`
    * **get all blueprints**  
      `GET /{project_id}/_blueprint`
    * **update all blueprints**  
      `PUT /{project_id}/_blueprint`
    
* Items are not namespaced, like elasticsearch's items  
    * **create item**  
      `POST /{project_id}/{blueprint_id}`
    * **update item**  
      `PUT /{project_id}/{blueprint_id}/{id}`
    * **delete item**  
      `DELETE /{project_id}/{blueprint_id}/{id}`

Now check out the documentation for the individual routes to see how it's really done.

# Group Projects
Projects are like an elasticsearch index or a postgresql database.  
For most projects, a namespace or the name of the project is a good identifier.
A project can be created in 2 different ways:

* You use the **Put blueprint** and / or **Put all blueprints** method(s) to store your blueprints, and then tag your project via **Tag project**
* You use the **Put project** method, described below, which is the same as **Put all blueprints** with the addition that it will automatically tag the project for you afterwards.

## General [/{project_id}]

#### Get project [GET]

This will retrieve all blueprints at their latest version.

+ Parameters
    + project_id (required, string, `myblog`) ... The identifier for your project.

+ Response 200 (application/json)
        
        {
            "post": {
                "elasticsearch": {
                    "type": "post"
                },
                "postgresql": {
                    "table": "posts"
                },
                "columns": {
                    "title_en": {
                        "type": "string"
                    },
                    "date_created": {
                        "type": "datetime"
                    }
                }
            },
            "comment": {
                "elasticsearch": {
                    "type": "comment"
                },
                "postgresql": {
                    "table": "comments"
                },
                "columns": {
                    "author": {
                        "type": "text"
                    },
                    "content": {
                        "type": "text"
                    },
                    "date_created": {
                        "type": "datetime"
                    }
                }
            }
        }

#### Put project [PUT]

This command does the same as [put blueprint](http://docs.dstore.apiary.io/#reference/blueprints/general/put-blueprint), with the addition that it will run [tag project](http://docs.dstore.apiary.io/#reference/projects/project-versions/tag-project) afterwards.

+ Parameters
    + project_id (required, string, `myblog`) ... The identifier for your project.

+ Request (application/json)

        {
            "post": {
                "elasticsearch": {
                    "type": "post"
                },
                "postgresql": {
                    "table": "posts"
                },
                "columns": {
                    "title_en": {
                        "type": "string"
                    },
                    "date_created": {
                        "type": "datetime"
                    }
                }
            },
            "comment": {
                "elasticsearch": {
                    "type": "comment"
                },
                "postgresql": {
                    "table": "comments"
                },
                "columns": {
                    "author": {
                        "type": "text"
                    },
                    "content": {
                        "type": "text"
                    },
                    "date_created": {
                        "type": "datetime"
                    }
                }
            }
        }

+ Response 200 (application/json)
        
        {
            "post": {
                "elasticsearch": {
                    "type": "post"
                },
                "postgresql": {
                    "table": "posts"
                },
                "columns": {
                    "title_en": {
                        "type": "string"
                    },
                    "date_created": {
                        "type": "datetime"
                    }
                }
            },
            "comment": {
                "elasticsearch": {
                    "type": "comment"
                },
                "postgresql": {
                    "table": "comments"
                },
                "columns": {
                    "author": {
                        "type": "text"
                    },
                    "content": {
                        "type": "text"
                    },
                    "date_created": {
                        "type": "datetime"
                    }
                }
            }
        }


### Delete project [DELETE]

This will remove the entire existance of a project (yes, this includes the databases and elasticsearch indexes for this project).

+ Parameters
    + project_id (required, string, `myblog`) ... The identifier for your project.

+ Response 204


## Project batch [/_project]

#### Get all projects [GET]

This will retrieve all blueprints for all projects at their latest version.

+ Response 200 (application/json)
        
        {
            "myblog": {
                "post": {
                    "elasticsearch": {
                        "type": "post"
                    },
                    "postgresql": {
                        "table": "posts"
                    },
                    "columns": {
                        "title_en": {
                            "type": "string"
                        },
                        "date_created": {
                            "type": "datetime"
                        }
                    }
                },
                "comment": {
                    "elasticsearch": {
                        "type": "comment"
                    },
                    "postgresql": {
                        "table": "comments"
                    },
                    "columns": {
                        "author": {
                            "type": "text"
                        },
                        "content": {
                            "type": "text"
                        },
                        "date_created": {
                            "type": "datetime"
                        }
                    }
                }
            }
        }

#### Put many projects [PUT]

This command does the same as [put many blueprints](http://docs.dstore.apiary.io/#reference/blueprints/blueprint-batch/put-many-blueprints), with the addition that it will run [tag project](http://docs.dstore.apiary.io/#reference/projects/project-versions/tag-project) afterwards.

+ Request (application/json)

        {
            "blog": {
                "post": {
                    "elasticsearch": {
                        "type": "post"
                    },
                    "postgresql": {
                        "table": "posts"
                    },
                    "columns": {
                        "title_en": {
                            "type": "string"
                        },
                        "date_created": {
                            "type": "datetime"
                        }
                    }
                },
                "comment": {
                    "elasticsearch": {
                        "type": "comment"
                    },
                    "postgresql": {
                        "table": "comments"
                    },
                    "columns": {
                        "author": {
                            "type": "text"
                        },
                        "content": {
                            "type": "text"
                        },
                        "date_created": {
                            "type": "datetime"
                        }
                    }
                }
            }
        }

+ Response 200 (application/json)
        
        {
            "blog": {
                "post": {
                    "elasticsearch": {
                        "type": "post"
                    },
                    "postgresql": {
                        "table": "posts"
                    },
                    "columns": {
                        "title_en": {
                            "type": "string"
                        },
                        "date_created": {
                            "type": "datetime"
                        }
                    }
                },
                "comment": {
                    "elasticsearch": {
                        "type": "comment"
                    },
                    "postgresql": {
                        "table": "comments"
                    },
                    "columns": {
                        "author": {
                            "type": "text"
                        },
                        "content": {
                            "type": "text"
                        },
                        "date_created": {
                            "type": "datetime"
                        }
                    }
                }
            }
        }


### Delete all projects [DELETE]

This will totally nuke everything, be **VERY CAREFUL**

+ Response 204


# Group Blueprints

Blueprints tell dstore what your data looks like.

This is used for:

* Validation of the input when storing items (via json schema).
    * **json schema** http://spacetelescope.github.io/understanding-json-schema/
    * **built-in schemas** https://github.com/trappsnl/dstore/tree/master/schemas
* Serialization of the input when sending the item to a specific store.
* Migration of the tables / creation of the elasticsearch mappings.
* Transforming of items to make it compatible with blueprints of different versions.


## General get [/{project_id}/{blueprint_id}/_blueprint/{project_version}]

### Get blueprint [GET]
+ Parameters
    + project_id (required, string, `myblog`) ... The identifier for your project.
    + blueprint_id (required, string, `post`) ... The identifier for the blueprint.
    + project_version (optional, string, `1`) Optional project version to retrieve the blueprint for.

+ Response 200 (application/json)
        
        {
            "type": "post",
            "elasticsearch": {
                "type": "post"
            },
            "postgresql": {
                "table": "posts"
            },
            "columns": {
                "title_en": {
                    "type": "string"
                },
                "date_created": {
                    "type": "datetime"
                }
            },
            "validation": {
                "allOf": [
                    {
                        "$ref": "item"
                    },
                    {
                        "type": "object",
                        "properties": {
                            "title_en": {
                                "type": "string"
                            },
                            "date_created": {
                                "$ref": "types#/definitions/datetime"
                            }
                        },
                        "required": [
                            "title_nl",
                            "date_created"
                        ]
                    } 
                ]
            }
        }

## General put [/{project_id}/{blueprint_id}/_blueprint]

### Put blueprint [PUT]
+ Parameters
    + project_id (required, string, `myblog`) ... The identifier for your project.
    + blueprint_id (required, string, `post`) ... The identifier for the blueprint.

+ Request (application/json)

        {
            "type": "newtype"
        }

+ Response 200 (application/json)
        
        {
            "type": "newtype",
            "elasticsearch": {
                "type": "post"
            },
            "postgresql": {
                "table": "posts"
            },
            "columns": {
                "title_en": {
                    "type": "string"
                },
                "date_created": {
                    "type": "datetime"
                }
            },
            "validation": {
                "allOf": [
                    { "$ref": "item" },
                    {
                        "type": "object",
                        "properties": {
                            "title_en": {
                                "type": "string"
                            },
                            "date_created": { "$ref": "types#/definitions/datetime" }
                        },
                        "required": [
                            "title_nl",
                            "date_created"
                        ]
                    } 
                ]
            }
        }

## Blueprint batch retrieve [/{project_id}/_blueprint/{project_version}]

### Get all blueprints [GET]
+ Parameters
    + project_id (required, string, `myblog`) ... The identifier for your project.
    + project_version (optional, string, `1`) Optional project version to retrieve the blueprint for.

+ Response 200 (application/json)

        {
            "post": {
                "blueprint_id": "post",
                "elasticsearch": {
                    "type": "post"
                },
                "postgresql": {
                    "table": "posts"
                },
                "columns": {
                    "title_en": {
                        "type": "string"
                    },
                    "content_en": {
                        "type": "text"
                    },
                    "date_created": {
                        "type": "datetime"
                    }
                }
            },
            "comment": {
                "type": "comment",
                "elasticsearch": {
                    "type": "comment"
                },
                "postgresql": {
                    "table": "comments"
                },
                "columns": {
                    "email": {
                        "type": "string"
                    },
                    "content": {
                        "type": "text"
                    },
                    "date_created": {
                        "type": "datetime"
                    }
                }
            }
        }


## Blueprint batch put [/{project_id}/_blueprint]

### Put many blueprints [PUT]
+ Parameters
    + project_id (required, string, `myblog`) ... The identifier for your project.

+ Request (application/json)

        {
            "post": {
                "blueprint_id": "post",
                "elasticsearch": {
                    "type": "post"
                },
                "postgresql": {
                    "table": "posts"
                },
                "columns": {
                    "title_en": {
                        "type": "string"
                    },
                    "content_en": {
                        "type": "text"
                    },
                    "date_created": {
                        "type": "datetime"
                    }
                }
            },
            "comment": {
                "blueprint_id": "comment",
                "elasticsearch": {
                    "type": "comment"
                },
                "postgresql": {
                    "table": "comments"
                },
                "columns": {
                    "post_id": {
                        "type": "uuid"
                    },
                    "email": {
                        "type": "string"
                    },
                    "message": {
                        "type": "string"
                    },
                    "date_created": {
                        "type": "datetime"
                    }
                }
            }
        }

+ Response 200 (application/json)
        
        {
            "post": {
                "blueprint_id": "post",
                "elasticsearch": {
                    "type": "post"
                },
                "postgresql": {
                    "table": "posts"
                },
                "columns": {
                    "title_en": {
                        "type": "string"
                    },
                    "content_en": {
                        "type": "text"
                    },
                    "date_created": {
                        "type": "datetime"
                    }
                }
            },
            "comment": {
                "blueprint_id": "comment",
                "elasticsearch": {
                    "type": "comment"
                },
                "postgresql": {
                    "table": "comments"
                },
                "columns": {
                    "post_id": {
                        "type": "uuid"
                    },
                    "email": {
                        "type": "string"
                    },
                    "message": {
                        "type": "string"
                    },
                    "date_created": {
                        "type": "datetime"
                    }
                }
            }
        }

# Group Versions

## Project versions [/{project_id}/_version]

### Get project version [GET]
+ Parameters
    + project_id (required, string, `myblog`) ... The identifier for your project.

+ Response 200 (application/json)
    
        {
          "project_version": 1,
          "blueprint_versions": {
            "post": [
              1
            ],
            "comment": [
              1
            ]
          }
        }

### Tag project [POST]
+ Parameters
    + project_id (required, string, `myblog`) ... The identifier for your project.

+ Response 200 (application/json)
    
        {
          "project_version": 2,
          "blueprint_versions": {
            "post": [
              1,
              2
            ],
            "comment": [
              1,
              2
            ]
          }
        }

## Project versions batch [/_project_version]

### Get all project versions [GET]

+ Response 200 (application/json)
    
        {
          "myblog": {
            "project_version": 1,
            "blueprint_versions": {
              "post": [
                1
              ],
              "comment": [
                1
              ]
            }
          }
        }

### Tag all projects [POST]

+ Response 200 (application/json)
    
        {
          "myblog": {
            "project_version": 2,
            "blueprint_versions": {
              "post": [
                1,
                2
              ],
              "comment": [
                1,
                2
              ]
            }
          }
        }


# Group Items
Items are like rows in a database and like a elasticsearch document.  
When you create or update an item, it will be validated by the provided json-schema in the blueprint.  
In case no json-schema is available for the blueprint, the system will validate the input the best it can.  
For more information about this convention, for now, [check the source](https://github.com/trappsnl/dstore/blob/master/lib/storage/itemRepository.js#L94-L132)

## General [/{project_id}/{blueprint_id}/{id}]

### Put item [PUT]
+ Parameters
    + project_id (required, string, `myblog`) ... The identifier for your project.
    + blueprint_id (optional, string, `post`) ... The identifier for the blueprint.
    + id (required, uuid, `c595b340-5fce-4a4e-9f85-67535939fa35`) ... The identifier of the item

+ Request (application/json)

        {
            "id": "c595b340-5fce-4a4e-9f85-67535939fa35",
            "title_en": "Hello world!",
            "content_en": "Oh hi!",
            "date_created": "2015-02-14T00:57:23.812Z"
        }

+ Response 200 (application/json)

        {
            "id": "c595b340-5fce-4a4e-9f85-67535939fa35",
            "title_en": "Hello world",
            "content_en": "Oh hi!",
            "date_created": "2015-02-14T00:57:23.812Z"
        }

+ Response 400 (application/json)

        {
            "message": "There were errors while validating your item",
            "errors": {
                "title_en": "The title_en property is required!",
                "date_created": "The date_created property should be of type 'datetime'"
            }
        }

### Delete item [DELETE]
+ Parameters
    + project_id (required, string, `myblog`) ... The identifier for your project.
    + blueprint_id (optional, string, `post`) ... The identifier for the blueprint.
    + id (required, uuid, `c595b340-5fce-4a4e-9f85-67535939fa35`) ... The identifier of the item.

+ Response 204

## Item batch [/{project_id}/{blueprint_id}]


### TODO Put many items [PUT]
+ Parameters
    + project_id (required, string, `myblog`) ... The identifier for your project.
    + blueprint_id (optional, string, `post`) ... The identifier for the blueprint.

+ Request (application/json)

        [
            {
                "id": "c595b340-5fce-4a4e-9f85-67535939fa35",
                "title_en": "Hello world!",
                "content_en": "Oh hi!",
                "date_created": "2015-02-14T00:57:23.812Z"
            }
        ]

+ Response 200 (application/json)

+ Response 400 (application/json)

        {
            "message": "There were errors while validating your item",
            "errors": {
                "c595b340-5fce-4a4e-9f85-67535939fa35": {
                    "title_en": "The title_en property is required!",
                    "date_created": "The date_created property is incorrect"
                }
            }
        }


### TODO Delete many items [DELETE]
+ Parameters
    + project_id (required, string, `myblog`) ... The identifier for your project.
    + blueprint_id (optional, string, `post`) ... The identifier for the blueprint.

+ Request (application/json)
        
        [
            "c595b340-5fce-4a4e-9f85-67535939fa35",
            "7216b142-bb17-4ba0-88b8-081517e15ab4"
        ]

+ Response 200 (application/json)
