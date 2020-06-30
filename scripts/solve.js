const SAMPLE_CODE       = 'function myScript(){return 100;}\n';
const CODE_AREA_ID      = 'code-area';
const CODE_OUTPUT_ID    = 'code-output';
const RUN_BUTTON_ID     = 'run-button';
const STOP_BUTTON_ID    = 'stop-button';
const HIDDEN_ATTRIBUTE  = 'hidden';
const NEWLINE           = '\n';
const SOLUTION_FUNCTION = 'solution';

let codeMirror;
let outputArea;
let runButton;
let stopButton;
let keepRunningCode;

window.addEventListener('load', function() {
  setupCodeMirror();
  setupElements();
});

/**
 * Sets up text editor.
 * Further modification to the text editor should be done here.
 **/
function setupCodeMirror() {
  codeMirror = CodeMirror(document.getElementById(CODE_AREA_ID), {
    value: SAMPLE_CODE,
    mode:  'javascript',
    lineNumbers: true,
  });

  codeMirror.on('change', function() {
    runStaticAnalysis(codeMirror.getValue());
  });
}

function setupElements() {
  outputArea    = document.getElementById(CODE_OUTPUT_ID);
  runButton     = document.getElementById(RUN_BUTTON_ID);
  stopButton    = document.getElementById(STOP_BUTTON_ID);
}

/**
 * Function to override functions call inside the sandbox interpreter.
 * This function serves as an interface between the browser and the sandbox.
 * 
 * By overriding alert() in the sandbox for example, we can modify alert()
 * so that its can be displayed on the GUI, outside of the sandbox.
 **/
function overrideFunctions(interpreter, scope) {
  let alertOverride = function(text) {
    outputArea.innerHTML += text + NEWLINE;
  };

  let assertOverride = function(isTrue, message) {
    if (!isTrue) {
      outputArea.innerHTML += message || "Assertion failed";
      keepRunningCode = false;
      updateButtons();
    }
  }

  interpreter.setProperty(scope, 'alert', 
    interpreter.createNativeFunction(alertOverride));
  interpreter.setProperty(scope, 'assert', 
    interpreter.createNativeFunction(assertOverride));
}

/**
 * Wrapper function around startRunningCode.
 * This function mostly serves to try to catch any syntax error 
 * encountered when trying to parse invalid JavaScript code,
 * preventing the interpreter from failing silently.
 *
 * Should an invalid JavaScript code be encountered, it will be
 * displayed to the user.
 **/
function executeCode() {
  outputArea.innerHTML  = '';
  keepRunningCode       = true;
  updateButtons();

  try {
    let code    = codeMirror.getValue();
    interpreter = new Interpreter(code, overrideFunctions);
    startRunningCode(interpreter); 
  } catch (error) {
    outputArea.innerHTML += error + NEWLINE;
    keepRunningCode = false;
    updateButtons();
  }
}

function updateButtons() {
  if (keepRunningCode) {
    runButton.setAttribute(HIDDEN_ATTRIBUTE, true);
    stopButton.removeAttribute(HIDDEN_ATTRIBUTE);
  } else {
    stopButton.setAttribute(HIDDEN_ATTRIBUTE, true);
    runButton.removeAttribute(HIDDEN_ATTRIBUTE);
  }
}

/**
 * Runs the interpreter step by step until we are finished.
 * Utilizes setTimeout() to allow other tasks to run too
 * and prevents the application from bricking in cases such as
 * infinite loops.
 *
 * Uses tryStep() to handle undefined reference error and
 * relay the error back to the user. Note that this error
 * is different than the one handled by executeCode().
 **/
function startRunningCode(interpreter) {
  function nextStep() {
    if (keepRunningCode && tryStep(interpreter)) {
      setTimeout(nextStep, 0);
    } else {
      keepRunningCode = false;
      updateButtons();
    }
  }
  nextStep();
}

function tryStep(interpreter) {
  try {
    return interpreter.step();
  } catch(error) {   
    outputArea.innerHTML += error + NEWLINE;
    return false;
  }
}

function stopRunningCode() {
  keepRunningCode = false;
  updateButtons();
}

function runStaticAnalysis(code) {
  let totalComplexity = 0;
  JSHINT(code);
  const results = JSHINT.data();
  results.functions.forEach(fn => totalComplexity += fn.metrics.complexity);

  unusedNames = results.unused ? results.unused.map(element => element.name) : [];
  let unused = unusedNames.filter(x => x !== SOLUTION_FUNCTION);

  metricsString = `Number of functions: ${results.functions.length}
      Unused functions and variables: ${unused.length > 0 ? unused.join(', ') : 'none'}
      The total cyclomatic compexity is ${totalComplexity}.`
  document.getElementById('analysis-output').innerText = metricsString;
}
