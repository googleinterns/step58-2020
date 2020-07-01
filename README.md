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
/scripts/           : client side JavaScript files
/stylesheets/       : client side CSS files
/test/              : Test files used to test /app.js and /modules/
```
