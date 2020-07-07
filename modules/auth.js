const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();

/**
 * @typedef {Object} User
 * @param {string} name
 * @param {string} email
 */
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
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
    return new User(payload['name'], payload['email']); 
  } catch(error) {
    // The API returns one of various errors indicating 
    // that the token is invalid in some way
    return null;
  }
}

module.exports.getUser = getUser;