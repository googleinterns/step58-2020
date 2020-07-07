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

let user;

/**
 * Helper function to check if an ID token is verified and create a new user object if so.
 * @param {string} token 
 * @return {Promise} Returns Promise resolving to a boolean.
 */
async function verify(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token
    });
    const payload = ticket.getPayload();
    user = new User(payload['name'], payload['email']); 
    return true;
  } catch(error) {
    // The API returns one of various errors indicating 
    // that the token is invalid in some way
    return false;
  }
}

/**
 * 
 * @param {string} token 
 * @returns {Promise} Returns Promise resolving to a User object
 */
async function getUser(token) {
  const verified = await verify(token)
  if (verified === true) {
    return user;
  } else {
    throw 'ID Token is not valid.';
  }
}