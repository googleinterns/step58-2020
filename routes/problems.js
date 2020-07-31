'use strict';

const multer  = require('multer');

const datastore = require('../modules/datastore.js');
const auth = require('../modules/auth.js');
const sandbox = require('../modules/code_sandbox_manager.js');

const PROBLEMS_KIND         = 'Problem';
const DEFAULT_PAGE_SIZE     = 5;
const DEFAULT_PAGE_INDEX    = 1;

/**
 * @typedef {Object} Problem
 * @param {number} id
 * @param {string} title
 * @param {string} text
 */
class Problem {
  constructor(id, title, text) {
    this.id = id;
    this.title = title;
    this.text = text;
  }
}

/**
 * Lists problems, filtering on whether they are user-submitted.
 * Does not limit user-submitted problems for now, as we need to
 * decide how to approach pagination for user-submitted problems
 * which do not have an incrementing ID.
 * @param {boolean} listUserSubmitted
 * @param {number} pageIndex
 * @param {number} pageSize
 */
async function listProblems(listUserSubmitted, pageIndex, pageSize) {
  let query = datastore
      .createQuery(PROBLEMS_KIND)
      .filter('userSubmitted', '=', listUserSubmitted);
  let entities = [];
  let problems = [];

  if (listUserSubmitted) {
    entities = (await datastore.runQuery(query))[0];
    problems = entities.map((entity) => {
      return new Problem(entity[datastore.KEY].id, entity.title, entity.text);
    });
    return problems;
  } else {
    const startId = pageSize * (pageIndex - 1);
    query = query
      .filter('id', '>', parseInt(startId))
      .order('id')
      .limit(parseInt(pageSize));
    entities = (await datastore.runQuery(query))[0];
    problems = entities.map((entity) => {
      return new Problem(entity.id, entity.title, entity.text);
    });
  }
  return problems;
}


module.exports = function(app) {
  const userSubmitted = async function(request, response, next) {
    if (Object.keys(request.query).length === 0 || request.query.userSubmitted === undefined) {
      return next();
    }

    const problems = await listProblems(true);

    response.render('problems', {
      problems: problems,
      userSubmitted: true,
    });
  };

  app.get('/problems', userSubmitted, async function(request, response) {
    const clientPageIndex   = parseInt(request.query.pageIndex) || DEFAULT_PAGE_INDEX;
    const clientPageSize    = parseInt(request.query.pageSize) || DEFAULT_PAGE_SIZE;

    const problems = await listProblems(false, clientPageIndex, clientPageSize);

    const problemsCount     = await datastore.countKind(PROBLEMS_KIND, {
      property: 'userSubmitted',
      operator: '=',
      value: false}
    );
    const pageCount         = Math.ceil(problemsCount / clientPageSize);
    const paginationArray   = Array.from(Array(pageCount), (_, i) => i + 1);

    response.render('problems', {
      problems: problems,
      paginationArray: paginationArray,
      currIndex: clientPageIndex
    });
  });

  app.post('/problems', multer().none(), async function(request, response) {
    const userResponse = (await auth.getUser(request.cookies.token));
    if (userResponse === null) {
      response.status(401).send('Not authenticated. Please log in.');
      return;
    }

    const problem = request.body;

    if (!(problem.title && problem.text && problem.code && problem.tests && problem.solution)) {
      response.status(400).send('Please fill out all fields.');
      return;
    }

    const executionResult = await sandbox.run(problem.solution + problem.tests);

    if (executionResult.signal === 'SIGTERM') {
      response.status(400).send('The code execution timed out.');
    } else if (executionResult.stderr) {
      response.status(400).send('Your solution didn\'t pass the test cases.');
    } else {
      problem.username = userResponse.user.username;
      problem.userSubmitted = true;
      problem.tests = problem.tests.split('\r\n');

      try {
        await datastore.store(PROBLEMS_KIND, problem);
        response.sendStatus(200);
      } catch (error) {
        response.status(500).send('Something went wrong.');
      }
    }
  });
}

