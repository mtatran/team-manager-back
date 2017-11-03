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
    "url": "/teams/:teamId/file/:fileId",
    "title": "Add file to team",
    "name": "addFileToTeam",
    "group": "Teams",
    "version": "1.0.0",
    "filename": "src/api/teams.ts",
    "groupTitle": "Teams",
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
    }
  },
  {
    "type": "POST",
    "url": "/teams/:teamId/file/:fileId",
    "title": "Add file to team",
    "name": "addFileToTeam",
    "group": "Teams",
    "version": "1.0.0",
    "filename": "src/api/teams.ts",
    "groupTitle": "Teams",
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
            "description": "<p>Can be either 'read' or 'write'</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n  permission: \"read\"\n}",
          "type": "JSON"
        }
      ]
    }
  },
  {
    "type": "POST",
    "url": "/teams/:teamId/add",
    "title": "Add User",
    "name": "addUserToTeam",
    "group": "Teams",
    "version": "1.0.0",
    "filename": "src/api/teams.ts",
    "groupTitle": "Teams",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "userId",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  message: \"done\"\n}",
          "type": "JSON"
        }
      ]
    }
  },
  {
    "type": "POST",
    "url": "/teams/create",
    "title": "Create Team",
    "name": "createTeam",
    "group": "Teams",
    "version": "1.0.0",
    "filename": "src/api/teams.ts",
    "groupTitle": "Teams",
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
          "content": "{\n   name: \"frontend\"\n}",
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
          "content": "{\n message: \"team created\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "GET",
    "url": "/teams/:teamId",
    "title": "Get Team Info",
    "name": "getTeam",
    "group": "Teams",
    "version": "1.0.0",
    "filename": "src/api/teams.ts",
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
    "url": "/users/profile",
    "title": "Get Self Profile",
    "name": "getProfile",
    "group": "Users",
    "version": "1.0.0",
    "filename": "src/api/users.ts",
    "groupTitle": "Users",
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
          },
          {
            "group": "Success 200",
            "type": "<a href=\"#api-Custom_types-ObjectUserposition\">UserPosition</a>[]",
            "optional": false,
            "field": "positions",
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
    "group": "Users",
    "version": "1.0.0",
    "filename": "src/api/users.ts",
    "groupTitle": "Users",
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
    "group": "Users",
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
    "groupTitle": "Users",
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
  },
  {
    "type": "GET",
    "url": "/google/files",
    "title": "Get drive files",
    "name": "googleGetFiles",
    "group": "google",
    "version": "1.0.0",
    "filename": "src/api/google.ts",
    "groupTitle": "google",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "pageSize",
            "description": "<p>Maximum documents responded</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "q",
            "description": "<p>Search Query</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "pageToken",
            "description": "<p>Page token for requesting a certain page</p>"
          }
        ]
      }
    },
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
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "canShare",
            "description": "<p>If the user has the permission to share this folder</p>"
          }
        ]
      }
    }
  },
  {
    "type": "GET",
    "url": "/google/redirect",
    "title": "Google OAuth2 Redirect",
    "name": "googleOAuth",
    "group": "google",
    "version": "1.0.0",
    "filename": "src/api/google.ts",
    "groupTitle": "google"
  },
  {
    "type": "GET",
    "url": "/google/callback",
    "title": "Google OAuth2 Callback",
    "name": "googleOAuthCallback",
    "group": "google",
    "version": "1.0.0",
    "filename": "src/api/google.ts",
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
    "filename": "src/api/google.ts",
    "groupTitle": "google"
  }
] });
