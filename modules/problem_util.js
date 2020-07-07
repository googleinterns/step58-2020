const path          = require('path'); 
const fs            = require('fs');
const yaml          = require('js-yaml');

const PROBLEMS_DIR  = path.join(__dirname, '../problems');

/**
 * Placeholder function that will be replaced once Datastore functionality
 * is ready.
 *
 * When implementing this functionality once Datastore is ready, make sure to
 * guarantee idempotency as it is likely that mass updating problems will be
 * a common operation.
 * Ex   : User added 20 new problems but there is still 5 old problems in /problems
 *        that should not create duplicate problems.
 *
 * Separated into its own function in case if we want to support adding problems
 * by other means than files in /problems such as using form in the web application.
 **/
function addProblem(problemObject) {
  console.log(problemObject);
}

/**
 * Recursively add problems from a given directory.
 * If no directory is specified, PROBLEMS_DIR is used by default.
 *
 * This is done recursively to allow users to better structure their problems
 * by separating them into directories, etc.
 **/
function addFromProblemsDir(dirName) {
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

