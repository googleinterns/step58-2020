'use strict';
const datastore = require('../modules/datastore.js');
const auth = require('../modules/auth.js');

const USER_KIND = 'User';

async function isRegistered(user) {
  const userQuery = datastore
      .createQuery(USER_KIND)
      .filter('email', '=', user.email)
      .select('__key__');
  const [users] = await datastore.runQuery(userQuery);
  return users.length > 0; 
}

module.exports = function(app) {
  app.post('/sign-in', async function(request, response) {
    let user;
    try {
      user = await auth.getUser(request.body.authToken);
    } catch(error) {
      response.sendStatus(500);
    }

    try {
      const registered = await isRegistered(user);
      if (!registered) {
        response.status(200).send(user);
      } else {
        response.sendStatus(203);
      }
    } catch(error) {
      response.sendStatus(500);
    }
  });
}