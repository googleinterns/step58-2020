'use strict';

const multer  = require('multer');

const datastore = require('../modules/datastore.js');
const auth = require('../modules/auth.js');
const sandbox = require('../modules/code_sandbox_manager.js');
const problemUtil   = require('../modules/problem_util.js');

const PROBLEMS_KIND         = 'Problem';
const DEFAULT_PAGE_SIZE     = 5;
const DEFAULT_PAGE_INDEX    = 1;
const LIST_OPTIONS = {
  ALL: {displayString: 'All', queryString: 'all'},
  OFFICIAL: {displayString: 'Official', queryString: 'official'},
  USER_SUBMITTED: {displayString: 'User-Submitted', queryString: 'user'},
}

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
 * Lists problems, filtering on the listOption that is requested.
 * @param {number} pageIndex
 * @param {number} pageSize
 * @param {string} listOption type of problems to list
 */
async function listProblems(pageIndex, pageSize, listOption) {
  let query = datastore
      .createQuery(PROBLEMS_KIND)
      .order('id')
      .limit(parseInt(pageSize));
  let entities = [];
  let problems = [];

  const offset = pageSize * (pageIndex - 1);

  if (listOption === LIST_OPTIONS.ALL.queryString) {
    query = query
      .filter('id', '>', parseInt(offset))
  } else {
    listOption = listOption === LIST_OPTIONS.USER_SUBMITTED.queryString;
    query = query
      .filter('userSubmitted', '=', listOption)
      .offset(offset);
  }

  entities = (await datastore.runQuery(query))[0];
  problems = entities.map((entity) => {
    return new Problem(entity.id, entity.title, entity.text);
  });

  return problems;
}


module.exports = function(app) {
  app.get('/problems', async function(request, response) {
    const clientPageIndex   = parseInt(request.query.pageIndex) || DEFAULT_PAGE_INDEX;
    const clientPageSize    = parseInt(request.query.pageSize) || DEFAULT_PAGE_SIZE;

    let problemsCount;
    let listOption = request.query.list;

    if (listOption === LIST_OPTIONS.OFFICIAL.queryString || 
        listOption === LIST_OPTIONS.USER_SUBMITTED.queryString) {
      const filter = listOption === LIST_OPTIONS.USER_SUBMITTED.queryString;
      problemsCount = await datastore.countKind(PROBLEMS_KIND, {
        property: 'userSubmitted',
        operator: '=',
        value: filter
      });
    } else {
      listOption = LIST_OPTIONS.ALL.queryString;
      problemsCount = await datastore.countKind(PROBLEMS_KIND, {
        property: 'id',
        operator: '>=',
        value: 1
      });
    }

    const problems = await listProblems(clientPageIndex, clientPageSize, listOption);
    const pageCount         = Math.ceil(problemsCount / clientPageSize);
    const paginationArray   = Array.from(Array(pageCount), (_, i) => i + 1);
    const listKey = (Object.keys(LIST_OPTIONS).find(key => LIST_OPTIONS[key].queryString === listOption));
    const displayString = LIST_OPTIONS[listKey].displayString;

    response.render('problems', {
      problems: problems,
      paginationArray: paginationArray,
      currIndex: clientPageIndex,
      listOption: listOption,
      display: displayString,
      LIST_OPTIONS: LIST_OPTIONS,
    });
  });

  app.post('/problems', multer().none(), async function(request, response) {
    const userResponse = (await auth.getUser(request.cookies.token));
    if (userResponse === null) {
      response.status(401).send('Not authenticated. Please log in.');
      return;
    }

    const problem = request.body;

    if (!(problemUtil.problemIsValid(problem))) {
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
        await problemUtil.storeProblem(problem);
        response.sendStatus(200);
      } catch (error) {
        response.status(500).send('Something went wrong.');
      }
    }
  });
}

