'use strict';

const datastore     = require('../modules/datastore.js');
const problemUtil   = require('../modules/problem_util.js');
const analyze       = require('../modules/code_metrics.js');
const sandbox       = require('../modules/code_sandbox_manager.js');
const auth          = require('../modules/auth.js');
const accessControl = require('../modules/access_control.js');

const PROBLEMS_KIND = 'Problem';
const SOLUTION_KIND = 'Solution';

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

/**
 * Helper function to save submission of solution.
 * Fields in data are not nested to allow easier filtering.
 **/
async function saveSubmission(user, code, analysisResult, problemId) {
  const data        = analysisResult;
  data.email        = user.email;
  data.code         = code;
  data.problemId    = parseInt(problemId);

  await datastore.store(SOLUTION_KIND, data);
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

  app.post('/problems/:id', async function(request, response) {
    const user  = await auth.getUser(request.body.authToken);
    if (user == null) {
      response.status(401).send('Not Authenticated');
      return;
    }

    if (await accessControl.hasSubmission(user, request.params.id)) {
      response.send(
        'You have already submitted a solution.\n' +
        'Click OK to compare it to other solutions!'
      );
      return;
    }

    const email     = user.email;
    const code      = request.body.code;
    const problem   = (await getProblem(request.params.id));
    const tests     = problem.tests;
    const timeout   = problem.timeout;

    const analysisResult    = analyze(code);
    const executionResult   = await sandbox.run(code + tests.join('\n'), timeout);

    if (executionResult.signal === 'SIGTERM') {
      response.status(400).send('Code execution timed out');
      return;
    }
    if (executionResult.stderr) {
      response.status(400).send('Code did not pass all test cases');
      return;
    } 

    await saveSubmission(user, code, analysisResult, request.params.id);
    response.send(
      'Your code passed all test cases.\n' +
      'Click OK to compare it to other solutions!'
    );
  });

  app.post('/analysis', function(request, response) {
    try {
      const results = analyze(request.body);
      response.send(results);
    } catch (error) {
      // Library throws error if it can't parse the source code.
      response.sendStatus(400);
    }
  });
}
