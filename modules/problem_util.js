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
async function addProblem(problemObject) {
  if (!problemIsValid(problemObject))
    return;

  problemObject.userSubmitted = false;
  const key = await generateKey(problemObject);
  datastore.store(key, problemObject);
}

/**
 * Generates key given a problem object to guarantee idempotency.
 * If a problem with the same id already exists, it will give the
 * entity's key such that it could be updated.
 * Otherwise, PROBLEMS_KIND is simply returned, indicating
 * that a new entity should be created.
 **/
async function generateKey(problemObject) {
  const query = datastore
    .createQuery(PROBLEMS_KIND)
    .filter('id', '=', problemObject.id);

  const [problems] = await datastore.runQuery(query);

  if (problems.length == 0) {
    return PROBLEMS_KIND;
  } else {
    return problems[0][datastore.KEY];
  }
}

/**
 * Determines whether a problem object is valid or not.
 * A valid problem is currently defined as one that contains
 * id, title, text, code, tests, and solution.
 **/
function problemIsValid(problemObject) {
  return problemObject.hasOwnProperty('id')     && 
    problemObject.hasOwnProperty('title')       &&
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
      addProblem(problem);
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

