const datastore = require('./datastore.js');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();

const USER_KIND = 'User';

/**
 * @typedef {Object} User
 * @param {string} key
 * @param {string} username
 * @param {string} name
 * @param {string} email
 * @param {string} pictureURL
 */
class User {
  constructor(key, username, name, email, pictureURL) {
    this.key        = key;
    this.username   = username;
    this.name       = name;
    this.email      = email;
    this.pictureURL = pictureURL;
  }
}

// returns undefined if email is no associated with a user in the datastore
async function getUserEntity(email) {
  const userQuery = datastore
      .createQuery(USER_KIND)
      .filter('email', '=', email);
  const [users] = await datastore.runQuery(userQuery);
  return users[0];
}

/**
 * Verifies if an ID token and returns User object if the token is valid.
 * @param {string} token 
 * @return {Promise} Returns Promise resolving to a User object or null.
 */
async function getUser(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token
    });
    const payload = ticket.getPayload();
    const user = await getUserEntity(payload.email);
    
    // User hasn't registered yet
    if (user === undefined) {
      return new User(null, null, payload.name, payload.email, payload.picture);
    }
    if(user.pictureURL == undefined){
      datastore.store(user[datastore.KEY], {username: user.username, name: user.name, email: user.email, pictureURL: payload.picture});
      return new User(user[datastore.KEY], user.username, user.name, user.email, payload.picture);
    } else {
      return new User(user[datastore.KEY], user.username, user.name, user.email, user.pictureURL);
    }
  } catch(error) {
    // The API returns one of various errors indicating 
    // that the token is invalid in some way
    return null;
  }
}

module.exports.getUser = getUser;