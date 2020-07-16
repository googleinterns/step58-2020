'use strict';
const datastore = require('../modules/datastore.js');
const auth = require('../modules/auth.js');

const USER_KIND = 'User';

async function getUsername(user) {
  const userQuery = datastore
      .createQuery(USER_KIND)
      .filter('email', '=', user.email);
  const [users] = await datastore.runQuery(userQuery);
  return users.length > 0 ? users[0].username : null;
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
      const username = await getUsername(user);
      if (!username) {
        response.status(200).send(user);
      } else {
        response.status(203).send(username);
      }
    } catch(error) {
      response.sendStatus(500);
    }
  });
}