'use strict';
const auth = require('../modules/auth.js');

module.exports = function(app) {
  app.get('/sign-in', async function(request, response) {
    const token = request.cookies.token;
    let userResponse;
    let user;

    try {
      userResponse = (await auth.getUser(token));
      user = userResponse.user;
      response.cookie('token', token, { expires: userResponse.expires});
    } catch(error) {
      response.sendStatus(500);
    }

    if (!user.username) {
      response.status(200).send(user);
    } else {
      response.cookie('username', user.username, {expires: userResponse.expires});
      response.status(203).send(user.username);
    }
  });
}