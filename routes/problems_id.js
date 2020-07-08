'use strict';

const datastore     = require('../modules/datastore.js');
const problemUtil   = require('../modules/problem_util.js');

const PROBLEMS_KIND = 'Problem';

problemUtil.addFromProblemsDir();

/**
 * Gets problem according to the id given.
 * Utilizes parseInt() as integer sent through request
 * may have its typing wrongly inferred by Node.
 **/
async function getProblem(id) {
  const query = datastore
    .createQuery(PROBLEMS_KIND)
    .filter('id', '=', parseInt(id));

  const [problems] = await datastore.runQuery(query);
  return problems[0];
}

module.exports = function(app) {
  /**
   * GET handler that displays problem dynamically according
   * to the problem id given in the request parameter.
   **/
  app.get('/problems/:id', async function(request, response) {
    const problem = await getProblem(request.params.id);
    let dynamicContent = {
      'question-title'  : problem.title,
      'question-text'   : problem.text,
      'initial-code'    : problem.code
    }

    response.render('solve', dynamicContent);
  });
}
