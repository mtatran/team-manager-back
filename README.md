# Team Manager Backend

[![Build Status][build-badge]][build] [![Standard code style][standard-badge]][standard]

[build]: https://travis-ci.org/teamwaterloop/team-manager-back
[build-badge]: https://travis-ci.org/teamwaterloop/team-manager-back.svg?branch=master

[standard]: https://standardjs.com
[standard-badge]: https://img.shields.io/badge/code_style-standard-brightgreen.svg

Back end for managing the team

## Steps to run the project

### 1. Install Dependences

For this project we are using yarn.

If you have yarn, just run:  ```yarn```

If you don't you can run ```npm install -g yarn``` to get it. Sudo might be required on mac/linux

### 2. Setup database credentials

Make sure you have access to a MySQL server. Ask tyler zhang (@tyler on slack) for credentials

Or setup your own! [How To setup MySQL server](https://dev.mysql.com/doc/mysql-getting-started/en/)

Copy **ormconfig.temp.json**, and rename it **ormconfig.json**

Edit the file to fill in your credentials. This file is gitignored so it shouldn't end up in the repo

### 3. You're ready to go!

Simply run ```yarn dev``` and the project should be up and running.

A nodemon process will listen for file changes and reload the server everytime you save a change
