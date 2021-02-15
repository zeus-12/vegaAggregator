var responsesList = {
    "200": {
        "description": "success"
    },
    "201": {
        "description": "success"
    },
    "400": {
        "description": "bad request"
    },
    "401": {
        "description": "auth failure"
    },
    "404": {
        "description": "no record found"
    },
    "408": {
        "description": "server timed out"
    },
    "409": {
        "description": "conflict"
    },
    "500": {
        "description": "some error occurred"
    }
}

var all = {
    "swagger": "2.0",
    "info": {
        "description": "All the APIs for supporting the Acceleron POS Software",
        "version": "1.0.0",
        "title": "Acceleron Server",
        "termsOfService": "https://accelerate.net.in/acceleron-terms.html",
        "contact": {"email": "support@accelerate.net.in"}
    },
    "host": "localhost:" + process.env.PORT,
    "basePath": "/",
    "tags": [
        {
            "name": "settings",
            "description": "APIs relating to the System Settings, Contents and Personalisations",
        },
        {
            "name": "table",
            "description": "APIs to create the Tables and filter out them with certain conditions",
        },
        {
            "name": "kot",
            "description": "APIs to create and manage the KOTs",
        },
        {
            "name": "user",
            "description": "APIs to create, edit, change User details",
        },
        {
            "name": "menu",
            "description": "APIs relating to Master Menu",
        }],
    "schemes": ["http"],
    "securityDefinitions": {
        "access_key": {"type": "apiKey", "name": "x-access-token", "in": "header"}
    },
    "definitions": {
        "Category":{
            "type": "object",
            "properties": {
              "categoryName":{
                "type": "string"
                }
            }
        },
        "Item": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "price": {
              "type": "string"
            },
            "code":{
              "type": "integer"
            },
            "vegFlag": {
              "type": "integer"
            },
            "isPackaged": {
              "type": "boolean"
            },
            "shortCode":{
                "type": "integer"
            },
            "cookingTime":{
                "type": "integer"
            },
            "ingredients": {
                "type": "array",
                "items":{
                  "type": "string"
                }
            },
            "isAvailable": {
              "type": "boolean"
            },
            "isCustom": {
              "type": "boolean"
            },
            "customOptions": {
              "type": "object"
            }
          }
        },
        "ApiResponse": {
          "type": "object",
          "properties": {
            "code": {
              "type": "integer",
              "format": "int32"
            },
            "type": {
              "type": "string"
            },
            "message": {
              "type": "string"
            }
          }
        }
      },
    "paths": {
        "/settings/{id}": {
            "get": {
                "tags": ["settings"],
                "summary": "To fetch the settings content",
                "description": "To fetch the settings content by its unique id",
                "operationId": "getSettingsById",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "description": "Settings ID",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/settings/{id}/newentry": {
            "post": {
                "tags": ["settings"],
                "summary": "To add new entry in settings",
                "description": "To add new entry to the settings content against its unique id. New entry object to be passed in body.",
                "operationId": "addNewItemToSettings",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "description": "Settings ID",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/settings/{id}/removeentry": {
            "post": {
                "tags": ["settings"],
                "summary": "To remove entry from settings",
                "description": "To add an entry from the settings content against its unique id. Entry object to be removed to be passed in body.",
                "operationId": "removeEntryFromSettings",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "description": "Settings ID",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/settings/{id}/filter": {
            "get": {
                "tags": ["settings"],
                "summary": "To filter from settings list",
                "description": "To filter out a specific entry from the list of entries in the settings content. For eg: System options, Personalisations against given machine id",
                "operationId": "filterItemFromSettingsList",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "description": "Settings ID",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "uniqueKey",
                        "in": "query",
                        "description": "Unique Identifier Key",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/settings/{id}/updateentry": {
            "post": {
                "tags": ["settings"],
                "summary": "To update item in settings list",
                "description": "To update a specific entry from the list of entries in the settings content. For eg: System options, Personalisations against given machine id",
                "operationId": "filterItemFromSettingsList",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "description": "Settings ID",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "uniqueKey",
                        "in": "query",
                        "description": "Unique Identifier Key",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/settings/applyquickfix": {
            "get": {
                "tags": ["settings"],
                "summary": "To perform quick fix",
                "description": "To perform quick fix actions on KOT/Bill index and table mappings",
                "operationId": "applyQuickFix",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "description": "Settings ID",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "fixKey",
                        "in": "query",
                        "description": "Unique Identifier Key - KOT / BILL / TABLE",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/table/{id}": {
            "get": {
                "tags": ["table"],
                "summary": "To get a table",
                "description": "To get a table by its unique id",
                "operationId": "getTableById",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "description": "Table ID",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/table/filter": {
            "get": {
                "tags": ["table"],
                "summary": "To filter tables",
                "description": "To filter out a specific set of table based on some conditions. For eg. Live Tables, Reserved Tables etc.",
                "operationId": "fetchTablesByFilter",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "key",
                        "in": "query",
                        "description": "Filter Key - all, live, name, section",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "uniqueId",
                        "in": "query",
                        "description": "Identifier - Table Name / Table ID etc.",
                        "required": false,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/table/{id}/resettable": {
            "get": {
                "tags": ["table"],
                "summary": "To reset a table",
                "description": "To reset a table to its original form",
                "operationId": "resetTable",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "description": "Table ID",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/table/create": {
            "post": {
                "tags": ["table"],
                "summary": "To create new table",
                "description": "To create a table to with generic contents",
                "operationId": "createNewTable",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "",
                        "in": "body",
                        "description": "Table Object",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/table/delete": {
            "post": {
                "tags": ["table"],
                "summary": "To delete table",
                "description": "To delete a table by given name",
                "operationId": "deleteTableByName",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "delete_table_name",
                        "in": "body",
                        "description": "Name of table to delete",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        }, 
        "/table/section/new": {
            "post": {
                "tags": ["table"],
                "summary": "To create table section",
                "description": "To create a new table section by given name",
                "operationId": "addNewTableSection",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "section_name",
                        "in": "body",
                        "description": "Table section name",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/table/section/delete": {
            "post": {
                "tags": ["table"],
                "summary": "To delete table section",
                "description": "To delete the table section by given name",
                "operationId": "deleteTableSection",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "delete_section_name",
                        "in": "body",
                        "description": "Table section name",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/user/{id}": {
            "get": {
                "tags": ["user"],
                "summary": "To get user",
                "description": "To get the user details against given user id",
                "operationId": "getUserById",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "description": "User Code",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/user/fetch": {
            "get": {
                "tags": ["user"],
                "summary": "To fetch all users",
                "description": "To fetch all users filtered by role",
                "operationId": "getAllUsers",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "filter",
                        "in": "query",
                        "description": "Filter by Role - admin / steward / agent",
                        "required": false,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/user/create": {
            "post": {
                "tags": ["user"],
                "summary": "To create user",
                "description": "To create a user with given details",
                "operationId": "createNewUser",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "",
                        "in": "body",
                        "description": "User Object",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/user/changepasscode": {
            "post": {
                "tags": ["user"],
                "summary": "To change user passcode",
                "description": "To change the passcode set by the user",
                "operationId": "changeUserPasscode",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "",
                        "in": "body",
                        "description": "Passcode Object",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/user/delete": {
            "post": {
                "tags": ["user"],
                "summary": "To delete user",
                "description": "To delete a user against the given user id",
                "operationId": "deleteUserById",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "delete_user_code",
                        "in": "body",
                        "description": "",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/kot/{id}": {
            "get": {
                "tags": ["kot"],
                "summary": "To get a KOT",
                "description": "To get a KOT by its unique id",
                "operationId": "getKOTById",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "description": "KOT ID",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/kot/filter": {
            "get": {
                "tags": ["kot"],
                "summary": "To filter KOTs",
                "description": "To filter out a specific set of KOTs based on some conditions. For eg. Dine or Non-dine.",
                "operationId": "fetchKOTsByFilter",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "key",
                        "in": "query",
                        "description": "Filter Key - all, dine, nondine",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/menu": {
            "get": {
                "tags": ["menu"],
                "summary": "To fetch complete menu",
                "description": "To fetch complete menu",
                "operationId": "getFullMenu",
                "produces": ["application/json"],
                "parameters": [],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/menu/category": {
            "get": {
                "tags": ["menu"],
                "summary": "To fetch list of category",
                "description": "To fetch complete list of category",
                "operationId": "getCategoryList",
                "produces": ["application/json"],
                "parameters": [],
                "responses": responsesList,
                "security": [{"access_key": []}]
            },
            "post": {
                "tags": ["menu"],
                "summary": "To create new category",
                "description": "To create new category",
                "operationId": "createNewCategory",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "body",
                        "in": "body",
                        "description": "Category Name",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/Category"
                          }
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/menu/category/{categoryName}": {
            "get": {
                "tags": ["menu"],
                "summary": "To get a category",
                "description": "To get the category details against given category name",
                "operationId": "getCategoryByName",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "categoryName",
                        "in": "path",
                        "description": "Category Name",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            },
            "put": {
                "tags": ["menu"],
                "summary": "To update category",
                "description": "To update new category name against given category name",
                "operationId": "updateCategoryByName",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "categoryName",
                        "in": "path",
                        "description": "Category Name",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "body",
                        "in": "body",
                        "description": "New Category Name",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/Category"
                          }
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            },
            "delete": {
                "tags": ["menu"],
                "summary": "To delete a category",
                "description": "To delete a category against given category name",
                "operationId": "deleteCategoryByName",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "categoryName",
                        "in": "path",
                        "description": "Category Name",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/menu/category/{categoryName}/item": {
            "get": {
                "tags": ["menu"],
                "summary": "To fetch all items of a given category",
                "description": "To fetch all items of a given category",
                "operationId": "getAllItems",
                "produces": ["application/json"],
                "parameters": [                    
                {
                    "name": "categoryName",
                    "in": "path",
                    "description": "Category Name",
                    "required": true,
                    "type": "string"
                }],
                "responses": responsesList,
                "security": [{"access_key": []}]
            },
            "post": {
                "tags": ["menu"],
                "summary": "To create new item",
                "description": "To create new item under a given category",
                "operationId": "createNewItem",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "categoryName",
                        "in": "path",
                        "description": "Category Name",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "body",
                        "in": "body",
                        "description": "Item Details",
                        "required": true,                        
                        "schema": {
                            "$ref": "#/definitions/Item"
                          }
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        },
        "/menu/category/{categoryName}/item/{itemCode}": {
            "get": {
                "tags": ["menu"],
                "summary": "To get an item",
                "description": "To get an item against given category name and item code",
                "operationId": "getItemByCode",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "categoryName",
                        "in": "path",
                        "description": "Category Name",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "itemCode",
                        "in": "path",
                        "description": "Item Code",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            },
            "put": {
                "tags": ["menu"],
                "summary": "To update an item",
                "description": "To update an item against given category name and item code",
                "operationId": "updateItemByCode",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "categoryName",
                        "in": "path",
                        "description": "Category Name",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "itemCode",
                        "in": "path",
                        "description": "Item Code",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "body",
                        "in": "body",
                        "description": "Update Item Details",
                        "required": true,                        
                        "schema": {
                            "$ref": "#/definitions/Item"
                          }
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            },
            "delete": {
                "tags": ["menu"],
                "summary": "To delete an item",
                "description": "To delete an item against given category name and item code",
                "operationId": "deleteItemByCode",
                "produces": ["application/json"],
                "parameters": [
                    {
                        "name": "categoryName",
                        "in": "path",
                        "description": "Category Name",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "itemCode",
                        "in": "path",
                        "description": "Item Code",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": responsesList,
                "security": [{"access_key": []}]
            }
        }        
    }
};

module.exports = all;