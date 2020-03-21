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
        }],
    "schemes": ["http"],
    "securityDefinitions": {
        "access_key": {"type": "apiKey", "name": "x-access-token", "in": "header"}
    },
    "definitions": {},
    "paths": {
        "/settings/fetch/{id}": {
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
        "/settings/new/{id}": {
            "post": {
                "tags": ["settings"],
                "summary": "To add new entry in settings",
                "description": "To add new entry to the settings content against its unique id",
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
        }
    }
};

module.exports = all;