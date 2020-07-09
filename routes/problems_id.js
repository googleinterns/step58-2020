'use strict';

const datastore     = require('../modules/datastore.js');
const problemUtil   = require('../modules/problem_util.js');
const analyze       = require('../modules/code_metrics.js');
const sandbox       = require('../modules/code_sandbox_manager.js');

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

  app.post('/problems/:id', function(request, response) {
    /** TODO (b/160783943) integrate with datastore
     * Test code by getting problem object from datastore and combine submitted source code with provided
     * test cases. If there are no errors, store as new submission along with analysis and redirect 
     * to updated rankings page. Otherwise, send response with failing test cases so client can alert user.
     **/
    
    console.log(request.body.code);
    console.log(analyze(request.body.code));
    response.send(false);
  });
}
