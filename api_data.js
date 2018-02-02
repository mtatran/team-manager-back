define({ "api": [
  {
    "type": "OBJECT",
    "url": "PartialTeam",
    "title": "PartialTeam",
    "group": "Custom_types",
    "version": "1.0.0",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": ""
          }
        ]
      }
    },
    "filename": "src/presentations/teamPresentation.ts",
    "groupTitle": "Custom_types",
    "name": "ObjectPartialteam"
  },
  {
    "type": "OBJECT",
    "url": "PartialUser",
    "title": "PartialUser",
    "group": "Custom_types",
    "version": "1.0.0",
    "success": {
      "fields": {
        "Success 200": [
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
            "field": "slackTag",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Enum",
            "optional": false,
            "field": "authority",
            "description": "<p>&quot;member&quot;, &quot;admin&quot;</p>"
          }
        ]
      }
    },
    "filename": "src/presentations/userPresentation.ts",
    "groupTitle": "Custom_types",
    "name": "ObjectPartialuser"
  },
  {
    "type": "OBJECT",
    "url": "TeamPosition",
    "title": "TeamPosition",
    "group": "Custom_types",
    "version": "1.0.0",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Enum",
            "optional": false,
            "field": "level",
            "description": "<p>&quot;member&quot;, &quot;coLead&quot;, &quot;lead&quot;</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "<a href=\"#api-Custom_types-ObjectPartialuser\">PartialUser</a>",
            "optional": false,
            "field": "PartialUser",
            "description": ""
          }
        ]
      }
    },
    "filename": "src/presentations/positionPresentation.ts",
    "groupTitle": "Custom_types",
    "name": "ObjectTeamposition"
  },
  {
    "type": "OBJECT",
    "url": "UserPosition",
    "title": "UserPosition",
    "group": "Custom_types",
    "version": "1.0.0",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Enum",
            "optional": false,
            "field": "level",
            "description": "<p>&quot;member&quot;, &quot;coLead&quot;, &quot;lead&quot;</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "<a href=\"#api-Custom_types-ObjectPartialteam\">PartialTeam</a>",
            "optional": false,
            "field": "team",
            "description": ""
          }
        ]
      }
    },
    "filename": "src/presentations/positionPresentation.ts",
    "groupTitle": "Custom_types",
    "name": "ObjectUserposition"
  },
  {
    "type": "DELETE",
    "url": "/teams/:teamId/files/:fileId",
    "title": "Add file to team",
    "name": "addFileToTeam",
    "group": "Teams",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamId",
            "description": "<p>Should be the valid mongodb team id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "fileId",
            "description": "<p>Should be the file id from google drive</p>"
          }
        ]
      }
    },
    "filename": "src/controllers/teamController.ts",
    "groupTitle": "Teams"
  },
  {
    "type": "POST",
    "url": "/teams/:teamId/files",
    "title": "Add file to team",
    "name": "addFileToTeam",
    "group": "Teams",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamId",
            "description": "<p>Should be the valid mongodb team id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "fileId",
            "description": "<p>Should be the file id from google drive</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "permission",
            "description": "<p>Can be either 'reader' or 'writer'</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n  permission: \"reader\"\n}",
          "type": "JSON"
        }
      ]
    },
    "filename": "src/controllers/teamController.ts",
    "groupTitle": "Teams"
  },
  {
    "type": "POST",
    "url": "/teams/create",
    "title": "Create Team",
    "name": "createTeam",
    "group": "Teams",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n  name: \"frontend\"\n}",
          "type": "JSON"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Team created&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\nmessage: \"team created\"\n }",
          "type": "json"
        }
      ]
    },
    "filename": "src/controllers/teamController.ts",
    "groupTitle": "Teams"
  },
  {
    "type": "GET",
    "url": "/teams",
    "title": "Get all teams",
    "name": "findAllTeams",
    "group": "Teams",
    "version": "1.0.0",
    "filename": "src/controllers/teamController.ts",
    "groupTitle": "Teams"
  },
  {
    "type": "GET",
    "url": "/teams/:teamId",
    "title": "Get Team Info",
    "name": "getTeam",
    "group": "Teams",
    "version": "1.0.0",
    "filename": "src/controllers/teamController.ts",
    "groupTitle": "Teams",
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
            "field": "name",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "<a href=\"#api-Custom_types-ObjectTeamposition\">TeamPosition</a>[]",
            "optional": false,
            "field": "positions",
            "description": ""
          }
        ]
      }
    }
  },
  {
    "type": "get",
    "url": "/users",
    "title": "Get User Profile",
    "name": "findAllUsers",
    "group": "Users",
    "version": "1.0.0",
    "filename": "src/controllers/userController.ts",
    "groupTitle": "Users"
  },
  {
    "type": "POST",
    "url": "/users/login",
    "title": "Login",
    "name": "login",
    "group": "Users",
    "version": "1.0.0",
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
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "authority",
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
    },
    "filename": "src/controllers/userController.ts",
    "groupTitle": "Users"
  },
  {
    "type": "POST",
    "url": "/users/login",
    "title": "Login",
    "name": "login",
    "group": "Users",
    "version": "1.0.0",
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
    },
    "filename": "src/controllers/userController.ts",
    "groupTitle": "Users"
  },
  {
    "type": "GET",
    "url": "/google/redirect",
    "title": "Google OAuth2 Redirect",
    "name": "googleOAuth",
    "group": "google",
    "version": "1.0.0",
    "filename": "src/controllers/googleController.ts",
    "groupTitle": "google"
  },
  {
    "type": "GET",
    "url": "/google/callback",
    "title": "Google OAuth2 Callback",
    "name": "googleOAuthCallback",
    "group": "google",
    "version": "1.0.0",
    "filename": "src/controllers/googleController.ts",
    "groupTitle": "google"
  },
  {
    "type": "GET",
    "url": "/google/isAuthenticated",
    "title": "Google OAuth2 Check",
    "name": "googleOAuthCheck",
    "group": "google",
    "version": "1.0.0",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "boolean",
            "optional": false,
            "field": "authenticated",
            "description": ""
          }
        ]
      }
    },
    "filename": "src/controllers/googleController.ts",
    "groupTitle": "google"
  }
] });