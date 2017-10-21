define({ "api": [
  {
    "type": "get",
    "url": "/users/profile",
    "title": "Get Self Profile",
    "name": "getProfile",
    "group": "users",
    "version": "1.0.0",
    "filename": "src/api/users.ts",
    "groupTitle": "users",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "phoneNumber",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "address",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "ISODate",
            "optional": false,
            "field": "createDate",
            "description": ""
          }
        ]
      }
    }
  },
  {
    "type": "POST",
    "url": "/users/login",
    "title": "Login",
    "name": "login",
    "group": "users",
    "version": "1.0.0",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>JWT for authentication</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    token: \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e...\"\n}",
          "type": "JSON"
        }
      ]
    },
    "filename": "src/api/users.ts",
    "groupTitle": "users",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n  email: \"me@tylerzhang.com\",\n  password: \"password\"\n}",
          "type": "JSON"
        }
      ]
    }
  },
  {
    "type": "POST",
    "url": "/users/signup",
    "title": "Signup",
    "name": "signup",
    "group": "users",
    "version": "1.0.0",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    message : \"user created\"\n}",
          "type": "JSON"
        }
      ]
    },
    "filename": "src/api/users.ts",
    "groupTitle": "users",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "address",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "phoneNumber",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n   address: \"111 waterloo st\",\n   email: \"me@tylerzhang.com\",\n   firstName: \"tyler\",\n   lastName: \"zhang\",\n   phoneNumber: \"123-456-789\",\n   password: \"password\"\n}",
          "type": "JSON"
        }
      ]
    }
  }
] });
