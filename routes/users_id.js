const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en');
TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');

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

  async function listSolutionsByUser(user) {
    const query = datastore
        .createQuery(SOLUTION_KIND)
        .filter('username', '=', user.username);
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
      solution.timestamp = timeAgo.format(solution.timestamp);
    }

    response.render('user', {username: username, solutions: solutions});
  });
}