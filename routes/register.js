'use strict';
const datastore = require('../modules/datastore.js');
const multer  = require('multer');

const USER_KIND = "User";

async function isValid(username) {
  const usernameQuery = datastore
      .createQuery(USER_KIND)
      .filter('username', '=', username)
      .select('__key__');
  const [usernames] = await datastore.runQuery(usernameQuery);
  return usernames.length === 0;
}

module.exports = function(app) {
  app.post('/register', multer().none(), async function(request, response) {
    let validUsername
    try {
      validUsername = await isValid(request.body.username);
    } catch(error) {
      response.sendStatus(500);
    }
    if (validUsername) {
      try {
        await datastore.store(USER_KIND, request.body);
        response.sendStatus(200);
      } catch(error) {
        response.sendStatus(500);
      }
    } else {
      response.status(403).send('Username is already taken');
    }
  });
}