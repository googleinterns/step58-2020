const datastore = require('./datastore.js');
const analyze = require('./code_metrics.js')

const SOLUTION_KIND = 'Solution';
const USER_KIND = 'User';

const solutionQuery = datastore.createQuery(SOLUTION_KIND);

async function addUsernames() {
  const [solutions] = await datastore.runQuery(solutionQuery);
  for (const solution of solutions) {
    // don't insert username if it's already set
    if (solution.username) {
      continue;
    }

    // don't insert username if email isn't stored
    const email = solution.email;
    if (!email) {
      continue;
    }
    
    const userQuery = datastore.createQuery(USER_KIND)
        .filter('email', '=', email);
    const [user] = await datastore.runQuery(userQuery);
    if (user.length === 1) {
      solution.username = user[0].username;
      await datastore.store(solution[datastore.KEY], solution);
    }
  }
}

async function addMetrics() {
  const [solutions] = await datastore.runQuery(solutionQuery);
  for (const solution of solutions) {
    const username = solution.username;
    if (!username) {
      continue;
    }
    
    metrics = analyze(solution.code);
    solution.cyclomatic = metrics.cyclomatic;
    solution.difficulty = metrics.difficulty;
    solution.lloc = metrics.lloc;
    await datastore.store(solution[datastore.KEY], solution);
  }
}

async function convertToDoubles() {
  const [solutions] = await datastore.runQuery(solutionQuery);
  for (const solution of solutions) {
    if (solution.difficulty) {
      solution.difficulty = datastore.double(solution.difficulty);
      datastore.update(solution);
    }
  }
}

