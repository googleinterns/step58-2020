'use strict';

/**
 * Sends the hash of the latest git commit.
 * Used for debugging purpose.
 **/
module.exports = function(app) {
  app.get('/version', async function(request, response) {
    const LATEST_HASH = require('child_process')
      .execSync('git rev-parse HEAD')
      .toString()
      .trim();

    response.send(LATEST_HASH);
  })
}

