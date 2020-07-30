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
const DIFFICULTY_DESC       = 'Halstead difficulty is a metric calculated based on the number of operands and operators in the function. The higher the number, the more difficult a program is to understand (e.g. in a code review).';
const LLOC_DESC             = 'Logical lines of code is a measure of the number of imperative statements in the program.';
const CYCLOMATIC_DESC       = 'Cyclomatic complexity is a measure of the number linearly independent paths through a program.';
const RANKING_MAPPING       = {
  'difficulty': {'title': 'Halstead Difficulty', 'description': DIFFICULTY_DESC},
  'cyclomatic': {'title': 'Cyclomatic Complexity', 'description': CYCLOMATIC_DESC},
  'lloc': {'title': 'Logical Lines of Code', 'description': LLOC_DESC},
}

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
      solutions: solutions,
      ranking: RANKING_MAPPING[rankBy],
    });
  });

  app.post('/problems/:id/solutions', async function(request, response) {
    const user          = (await auth.getUser(request.cookies.token)).user;
    const hasPrivilege  = await accessControl.hasSubmission(user, request.params.id);

    if (!hasPrivilege) {
      response.sendStatus(401);
    } else {
      const code = await getSubmittedCode(request.params.id, request.body.username);
      response.send(code);
    }
  });
}
