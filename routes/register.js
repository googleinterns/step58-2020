'use strict';
const datastore = require('../modules/datastore.js');
const auth = require('../modules/auth.js');
const multer  = require('multer');

const USER_KIND = 'User';

/**
 * Checks if a username is valid by testing against a regular
 * expression and querying the database.
 * @param {string} username 
 * @returns {boolean}
 */
async function isValid(username) {
  // Check that username contains only letters, digits, or
  // underscores and is at least one character.
  const regex = /\W/;
  if (regex.test(username) || username.length === 0) {
    return false;
  }

  // Query database to see if the username is taken
  const usernameQuery = datastore
      .createQuery(USER_KIND)
      .filter('username', '=', username)
      .select('__key__');
  const [usernames] = await datastore.runQuery(usernameQuery);
  return usernames.length === 0;
}

module.exports = function(app) {
  app.post('/register', multer().none(), async function(request, response) {
    let validUsername;
    try {
      validUsername = await isValid(request.body.username);
    } catch(error) {
      response.sendStatus(500);
    }
    
    if (!validUsername) {
      response.status(403).send('Username is already taken');
    }

    try {
      const userResponse = auth.getUser(request.cookies.token);
      response.cookie('username', request.body.username, {expires: userResponse.expires});
      await datastore.store(USER_KIND, request.body);
      response.sendStatus(200);
    } catch(error) {
      console.log(error);
      response.sendStatus(500);
    }
  });
}