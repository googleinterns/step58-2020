'use strict';

const datastore             = require('../modules/datastore.js');

const SOLUTION_KIND         = 'Solution';
const DEFAULT_LIMIT         = 15;
const DEFAULT_SORT          = 'complexity';
const DEFAULT_IS_DESCENDING = false;

async function getSolutions(problemId, limit, sortBy, isDescending) {
  const query = datastore
    .createQuery(SOLUTION_KIND)
    .filter('problemId', '=', parseInt(problemId))
    .order(sortBy, {
      descending: isDescending,
    })
    .limit(parseInt(limit));

  return (await datastore.runQuery(query))[0];
}

module.exports = function(app) {
  /**
   * GET handler that displays problem dynamically according
   * to the problem id given in the request parameter.
   **/
  app.get('/problems/:id/solutions', async function(request, response) {
    const solutions = await getSolutions(request.params.id, DEFAULT_LIMIT, DEFAULT_SORT, DEFAULT_IS_DESCENDING);
    response.render('solutions', {solutions: solutions});
  });
}
