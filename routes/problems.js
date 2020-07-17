'use strict';

const datastore = require('../modules/datastore.js');

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

async function listProblems(pageIndex, pageSize) {
  const startId = pageSize * (pageIndex - 1);
  const query = datastore
    .createQuery(PROBLEMS_KIND)
    .filter('id', '>', parseInt(startId))
    .order('id')
    .limit(parseInt(pageSize));

  return (await datastore.runQuery(query))[0];
}


module.exports = function(app) {
  app.get('/problems', async function(request, response) {
    const clientPageIndex   = parseInt(request.query.pageIndex) || DEFAULT_PAGE_INDEX;
    const clientPageSize    = parseInt(request.query.pageSize) || DEFAULT_PAGE_SIZE;

    const entities = await listProblems(clientPageIndex, clientPageSize);
    const problems = entities.map((entity) => {
      return new Problem(entity.id, entity.title, entity.text);
    });

    const problemsCount     = await datastore.countKind(PROBLEMS_KIND);
    const pageCount         = Math.ceil(problemsCount / clientPageSize);
    const paginationArray   = Array.from(Array(pageCount), (_, i) => i + 1);

    response.render('problems', {
      problems: problems,
      paginationArray: paginationArray
    });
  });
}

