const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en');
TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');

const datastore = require('../modules/datastore.js');

const USER_KIND = 'User';
const SOLUTION_KIND = 'Solution';

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
        .filter('username', '=', user.username)
        .order('timestamp', {descending: true});
    const [userSolutions] = await datastore.runQuery(query);
    return userSolutions;
  }

  async function getProblems(problemIds) {
    const problems = await Promise.all(problemIds.map(async (id) => {
      return await datastore.getProblem(id);
    }));
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
      const currProblem = solvedProblems.filter((problem) => {
        if (problem.userSubmitted) {
          return parseInt(problem[datastore.KEY].id) === solution.problemId
        }
        return problem.id === solution.problemId
      })[0];

      solution.problemTitle = currProblem.title
      solution.userSubmitted = currProblem.userSubmitted;
      solution.timestamp = timeAgo.format(solution.timestamp);
    }

    response.render('user', {username: username, solutions: solutions, pictureURL: user.pictureURL});
  });
}