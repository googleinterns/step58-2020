'use strict';

const path          = require('path'); 
const fs            = require('fs');
const yaml          = require('js-yaml');
const datastore     = require('./datastore.js');

const PROBLEMS_DIR  = path.join(__dirname, '../problems');
const PROBLEMS_KIND = 'Problem';

/**
 * Adds a new problem to the Datastore given a problem object.
 * Asserts that the problem is valid using problemIsValid
 * and guarantees idempotency.
 **/
async function addProblem(problemObject, filePath) {
  if (!problemIsValid(problemObject))
    return;

  problemObject.userSubmitted = false;

  if (problemObject.id == undefined) {
    await writeId(problemObject, filePath);
  } else {
    const key = await getKey(problemObject.id);
    datastore.store(key, problemObject);
  }
}

/**
 * Writes the next id to problem provided via a YAML file.
 * Uses a datastore transaction, which uses a reader/writer lock
 * to enforce serializable isolation (i.e. concurrent writes
 * will not occur).
 * @param {Object} problemObject
 * @param {string} filePath
 */
async function writeId(problemObject, filePath) {
  const transaction = datastore.transaction();

  try {
    await transaction.run();

    problemObject.id = await getHighestId() + 1;
    writeYamlFile(filePath, problemObject);
    problemObject.timestamp = new Date();

    transaction.save({
      key: datastore.key(PROBLEMS_KIND),
      data: problemObject
    });
    transaction.commit();
  } catch (error) {
    console.error(error);
    transaction.rollback();
  }
}

/**
 * Helper function to get the highest ID in the datastore.
 * @returns id
 */
async function getHighestId() {
  const query = datastore
      .createQuery(PROBLEMS_KIND)
      .order('id', {descending: true})
      .select('id')
      .limit(1);
  const [results] = await datastore.runQuery(query);
  return results[0].id;
}

/**
 * Writes YAML file to the specified file path.
 * @param {string} filePath
 * @param {Object} object
 */
function writeYamlFile(filePath, object) {
  const yamlDocument = yaml.safeDump(object);
  fs.writeFileSync(filePath, yamlDocument);
}

/**
 * Generates key given a problem object to guarantee idempotency.
 * If a problem with the same id already exists, it will give the
 * entity's key such that it could be updated.
 **/
async function getKey(problemId) {
  const query = datastore
    .createQuery(PROBLEMS_KIND)
    .filter('id', '=', problemId)
    .select('__key__');

  const [problems] = await datastore.runQuery(query);

  return problems[0][datastore.KEY];
}

/**
 * Determines whether a problem object is valid or not.
 * A valid problem is currently defined as one that contains
 * id, title, text, code, tests, and solution.
 **/
function problemIsValid(problemObject) {
  return problemObject.hasOwnProperty('title')  &&
    problemObject.hasOwnProperty('text')        &&
    problemObject.hasOwnProperty('code')        &&
    problemObject.hasOwnProperty('tests')       &&
    problemObject.hasOwnProperty('solution');
}

/**
 * Recursively add problems from a given directory.
 * If no directory is specified, PROBLEMS_DIR is used by default.
 *
 * This is done recursively to allow users to better structure their problems
 * by separating them into directories, etc.
 **/
async function addFromProblemsDir(dirName) {
  dirName = dirName || PROBLEMS_DIR;
  fs.readdirSync(dirName).forEach(function(fileName) {

    let fullName    = path.join(dirName, fileName);
    let stat        = fs.lstatSync(fullName);

    if (stat.isDirectory()) {
      addFromProblemsDir(fullName);
    }

    if (path.extname(fullName) === '.yaml') {
      let problem = readYamlFile(fullName);
      addProblem(problem, fullName);
    }
  });
}

function readYamlFile(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return yaml.safeLoad(fileBuffer);
}

module.exports = {
  addProblem: addProblem,
  addFromProblemsDir: addFromProblemsDir
};

