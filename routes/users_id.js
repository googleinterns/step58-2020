const datastore = require('../modules/datastore.js');

const USER_KIND = 'User';
const SOLUTION_KIND = 'Solution';
const PROBLEM_KIND = 'Problem';

module.exports = function(app) {
  async function getUser(username) {
    const query = datastore
        .createQuery(USER_KIND)
        .filter('username', '=', username)
        .limit(1);
    const [users] = await datastore.runQuery(query);
    return users[0];
  }

  /* Helper function to get solutions submitted by a user.
   * TODO(b/161439920) filter by user ID rather than email. 
   */
  async function listSolutionsByUser(user) {
    const query = datastore
        .createQuery(SOLUTION_KIND)
        .filter('email', '=', user.email);
    const [userSolutions] = await datastore.runQuery(query);
    return userSolutions;
  }

  async function getProblems(problemIds) {
    let problems = [];
    for (const id of problemIds) {
      const query = datastore
          .createQuery(PROBLEM_KIND)
          .filter('id', '=', id)
          .limit(1);
      let [problem] = await datastore.runQuery(query);
      problems.push(problem[0])
    }
    
    return problems;
  }

  app.get('/users/:username', async function(request, response) {
    const username = request.params.username;
    const user = await getUser(username);

    if (!user) {
      response.sendStatus(404);
    }

    const solutions = await listSolutionsByUser(user);
    const solvedProblemIds = solutions.map(solution => solution.problemId);
    const solvedProblems = await getProblems(solvedProblemIds);
    
    for (const solution of solutions) {
      solution.problemTitle = 
          solvedProblems.filter(problem => problem.id === solution.problemId)[0].title;
    }

    response.render('user', {username: username, solutions: solutions, pictureURL: user.pictureURL});
  });
}