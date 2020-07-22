'use strict';
const auth = require('../modules/auth.js');

module.exports = function(app) {
  app.post('/sign-in', async function(request, response) {
    let user;
    try {
      user = await auth.getUser(request.body.authToken);
    } catch(error) {
      response.sendStatus(500);
    }

    if (!user.username) {
      response.status(200).send(user);
    } else {
      response.status(203).send(user.username);
    }
  });
}