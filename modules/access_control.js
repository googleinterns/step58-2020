'use strict';

const datastore = require('../modules/datastore.js');

const SOLUTION_KIND = 'Solution';

/**
 * Checks if a user has submitted an accepted solution before
 * for a given problemId.
 **/
async function hasSubmission(user, problemId) {
  try {
    const query = datastore
      .createQuery(SOLUTION_KIND)
      .filter('problemId', '=', parseInt(problemId))
      .filter('username', '=', user.username);

    const [problems] = await datastore.runQuery(query);
    return problems.length != 0;
  } catch(error) {
    return false;
  }
}

module.exports.hasSubmission = hasSubmission;
