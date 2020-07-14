'use strict';

const datastore             = require('../modules/datastore.js');
const auth                  = require('../modules/auth.js');
const accessControl         = require('../modules/access_control.js');

const SOLUTION_KIND         = 'Solution';
const DEFAULT_LIMIT         = 15;
const DEFAULT_SORT          = 'complexity';
const DEFAULT_IS_DESCENDING = false;


/**
 * Utility function to get a list of submitted solutions to display.
 * Note that the code is not included in this query as it will be
 * handled by POST request handler, which will check if the client
 * has enough privilege to view the code.
 **/
async function listSolutions(problemId, limit, sortBy, isDescending) {
  const query = datastore
    .createQuery(SOLUTION_KIND)
    .filter('problemId', '=', parseInt(problemId))
    .order(sortBy, {
      descending: isDescending,
    })
    .limit(parseInt(limit))
    .select(['email', 'complexity']);

  return (await datastore.runQuery(query))[0];
}

async function getSubmittedCode(problemId, email) {
  const query = datastore
    .createQuery(SOLUTION_KIND)
    .filter('problemId', '=', parseInt(problemId))
    .filter('email', '=', email)
    .select(['code']);

  return (await datastore.runQuery(query))[0];
}

module.exports = function(app) {
  /**
   * GET handler that displays problem dynamically according
   * to the problem id given in the request parameter.
   **/
  app.get('/problems/:id/solutions', async function(request, response) {
    const solutions = await listSolutions(request.params.id, DEFAULT_LIMIT, DEFAULT_SORT, DEFAULT_IS_DESCENDING);
    response.render('solutions', {solutions: solutions});
  });

  app.post('/problems/:id/solutions', async function(request, response) {
    const user          = await auth.getUser(request.body.authToken);
    const hasPrivilege  = await accessControl.hasSubmission(user, request.params.id);

    if (!hasPrivilege) {
      response.sendStatus(401);
    } else {
      const code = await getSubmittedCode(request.params.id, request.body.email);
      response.send(code);
    }
  });
}
