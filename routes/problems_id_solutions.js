'use strict';

const datastore             = require('../modules/datastore.js');
const auth                  = require('../modules/auth.js');
const accessControl         = require('../modules/access_control.js');

const SOLUTION_KIND         = 'Solution';
const PROBLEM_KIND          = 'Problem';
const USER_KIND             = 'User';
const DEFAULT_RANK          = 'difficulty';
const DEFAULT_LIMIT         = 15;
const DEFAULT_IS_DESCENDING = false;

/**
 * Utility function to get a list of submitted solutions to display.
 * Note that the code is not included in this query as it will be
 * handled by POST request handler, which will check if the client
 * has enough privilege to view the code.
 **/
async function listSolutions(problemId, limit, rankBy, isDescending) {
  const query = datastore
    .createQuery(SOLUTION_KIND)
    .filter('problemId', '=', parseInt(problemId))
    .order(rankBy, {
      descending: isDescending,
    })
    .limit(parseInt(limit))
    .select(['username', rankBy]);

  return (await datastore.runQuery(query))[0];
}

async function getSubmittedCode(problemId, username) {
  const query = datastore
    .createQuery(SOLUTION_KIND)
    .filter('problemId', '=', parseInt(problemId))
    .filter('username', '=', username)
    .select(['code']);

  return (await datastore.runQuery(query))[0];
}

async function getProblemTitle(problemId) {
  const query = datastore
      .createQuery(PROBLEM_KIND)
      .filter('id', '=', parseInt(problemId))
      .select('title');

  const [results] = (await datastore.runQuery(query))[0];
  return results.title;
}

module.exports = function(app) {
  /**
   * GET handler that displays problem dynamically according
   * to the problem id given in the request parameter.
   **/
  app.get('/problems/:id/solutions', async function(request, response) {
    const problemId = request.params.id;
    const problemTitle = await getProblemTitle(problemId);
    const rankBy = request.query.rank || DEFAULT_RANK;

    const solutions = await listSolutions(problemId, DEFAULT_LIMIT, rankBy, DEFAULT_IS_DESCENDING);

    response.render('solutions', {
      problemId: problemId,
      problemTitle: problemTitle,
      solutions: solutions
    });
  });

  app.post('/problems/:id/solutions', async function(request, response) {
    const user          = await auth.getUser(request.body.authToken);
    const hasPrivilege  = await accessControl.hasSubmission(user, request.params.id);

    if (!hasPrivilege) {
      response.sendStatus(401);
    } else {
      const code = await getSubmittedCode(request.params.id, request.body.username);
      response.send(code);
    }
  });
}
