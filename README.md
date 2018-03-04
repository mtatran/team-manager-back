# Team Manager Backend

[![Build Status][build-badge]][build] [![Standard code style][standard-badge]][standard]

[build]: https://travis-ci.org/waterloop/team-manager-back
[build-badge]: https://travis-ci.org/waterloop/team-manager-back.svg?branch=master

[standard]: https://standardjs.com
[standard-badge]: https://img.shields.io/badge/code_style-standard-brightgreen.svg

Back end for managing the team

**[Checkout the API documentation here](https://teamwaterloop.github.io/team-manager-back/)**

**[Checkout the Frontend Repo here](https://github.com/teamwaterloop/team-manager-front/)**

## Steps to run the project

### 1. Install Dependences

For this project we are using yarn.

If you have yarn, just run:  ```yarn```

If you don't you can run ```npm install -g yarn``` to get it. Sudo might be required on mac/linux

### 2. Setup Environment

Copy **.env.example** and rename it **.env**

Put in something random for **API_SECRET** and then set API\_URL to be http://localhost.com
(This will be the url the server thinks its hosting from and is just for testing purposes)

Now OAuth authentications will redirect back to http://localhost.com but you don't own that domain.

So in your hosts file, add an entry that redirects http://localhost.com to 127.0.0.1 (localhost)

[Doing it on Linux](http://www.makeuseof.com/tag/modify-manage-hosts-file-linux/)

[Doing it on Windows](https://support.rackspace.com/how-to/modify-your-hosts-file/)


### 3. Setup database credentials

Make sure you have access to a MySQL server. Ask tyler zhang (@tyler on slack) for credentials

Or setup your own! [How To setup MySQL server](https://dev.mysql.com/doc/mysql-getting-started/en/)

Edit the .env file and input your credentials. This file is gitignored so it shouldn't end up in the repo


### 4. You're ready to go!

Simply run ```yarn dev``` and the project should be up and running.

A nodemon process will listen for file changes and reload the server everytime you save a change
