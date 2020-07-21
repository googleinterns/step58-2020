# Yellow Brick Code
![Yellow Brick Code Logo](https://raw.githubusercontent.com/googleinterns/step58-2020/master/html/images/YellowBrickCodeLogo.png)

## About
This repo contains the source code for La'Zshane', Nick, and Ife's STEP capstone project. Yellow Brick Code is a web app that aims to teach coders to write healthy and maintainable code.

## Contributors
Authors:
- La'Zshane' Hoskins ([@lalaAdasia00](https://github.com/lalaAdasia00))
- Nick Husin ([@Nicholas2750](https://github.com/Nicholas2750))
- Ife Omidiran ([@ifeomi](https://github.com/ifeomi))

Hosts:
- Ian Tay ([@chronologos](https://github.com/chronologos))
- Mihir Ray ([@raymihir](https://github.com/raymihir))

## Build Instruction

```
npm install
```

## Deploy Instruction

```
gcloud app deploy
```

## Add Dependency Instruction

For application dependency:
```
npm install <package-name>
```

For development dependency:
```
npm install <package-name> --save-dev
```

## Current Scripts

Run test cases:

```
npm test
```

Run server locally:

```
npm start
```

## Project Structure

```
/app.js             : Entrypoint for the server. Mostly serve to handle routing with the complicated task being handled by /modules/
/app.yaml           : Configurations used when deploying on Google AppEngine
/cloudbuild.yaml    : Specifies what build check should be done for pull requests, such as making sure all test cases pass
/html/              : Client side HTML files
/lib/               : Client side libraries
/modules/           : Server side NodeJS modules
/package.json       : Configurations and scripts of this project
/scripts/           : Client side JavaScript files
/stylesheets/       : Client side CSS files
/test/              : Test files used to test /app.js and /modules/
```
