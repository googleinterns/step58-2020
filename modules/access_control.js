'use strict';

const datastore = require('../modules/datastore.js');

const SOLUTION_KIND = 'Solution';

/**
 * Checks if a user has submitted an accepted solution before
 * for a given problemId.
 **/
async function hasSubmission(user, problemId) {
  const query = datastore
    .createQuery(SOLUTION_KIND)
    .filter('problemId', '=', parseInt(problemId))
    .filter('email', '=', user.email);

  const [problems] = await datastore.runQuery(query);
  return problems.length != 0;
}

module.exports.hasSubmission = hasSubmission;
