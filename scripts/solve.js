import { idToken } from './auth.js';

const INITIAL_CODE_ID   = 'initial-code';
const CODE_AREA_ID      = 'code-area';
const CODE_OUTPUT_ID    = 'code-output';
const RUN_BUTTON_ID     = 'run-button';
const STOP_BUTTON_ID    = 'stop-button';
const SUBMIT_BUTTON_ID  = 'submit-button';
const HIDDEN_ATTRIBUTE  = 'hidden';
const NEWLINE           = '\n';
const SOLUTION_FUNCTION = 'solution';
const LOADING_BUTTON    = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading...';

let codeMirror;
let outputArea;
let runButton;
let stopButton;
let submitButton;
let keepRunningCode;
let interpreter;
let lastMarking;

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
    value: document.getElementById(INITIAL_CODE_ID).value,
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
  submitButton  = document.getElementById(SUBMIT_BUTTON_ID)

  runButton.addEventListener('click', executeCode);
  stopButton.addEventListener('click', stopRunningCode);
  submitButton.addEventListener('click', submitSolution);
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
      updateInterface();
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
  updateInterface();

  try {
    let code        = codeMirror.getValue();
    let interpreter = new Interpreter(code, overrideFunctions);
    startRunningCode(interpreter); 
  } catch (error) {
    outputArea.innerHTML += error + NEWLINE;
    keepRunningCode = false;
    updateInterface();
  }
}

function updateInterface() {
  if (keepRunningCode) {
    runButton.setAttribute(HIDDEN_ATTRIBUTE, true);
    stopButton.removeAttribute(HIDDEN_ATTRIBUTE);
    codeMirror.setOption('readOnly', true);
  } else {
    stopButton.setAttribute(HIDDEN_ATTRIBUTE, true);
    runButton.removeAttribute(HIDDEN_ATTRIBUTE);
    codeMirror.setOption('readOnly', false);
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
      highlightCode(interpreter);
      setTimeout(nextStep, 0);
    } else {
      keepRunningCode = false;
      updateInterface();
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
  updateInterface();
}

function runStaticAnalysis(code) {
  let totalComplexity = 0;
  JSHINT(code);
  const results = JSHINT.data();
  results.functions.forEach(fn => totalComplexity += fn.metrics.complexity);

  const unusedNames = results.unused ? results.unused.map(element => element.name) : [];
  // TODO(@ifeomi) revisit this once we have clarity on how test cases will be provided
  let unused = unusedNames.filter(x => x !== SOLUTION_FUNCTION);

  const metricsString = `Number of functions: ${results.functions.length}
      Unused functions and variables: ${unused.length > 0 ? unused.join(', ') : 'none'}
      The total cyclomatic complexity is ${totalComplexity}.`
  document.getElementById('analysis-output').innerText = metricsString;
}

async function submitSolution() {
  submitButton.disabled     = true;
  submitButton.innerHTML    = LOADING_BUTTON;
  const payload = new Blob([JSON.stringify({authToken: idToken, code: codeMirror.getValue()})], {type: 'application/json'});

  const response        = await fetch(`${location.pathname}`, {method: 'POST', body: payload})
  const responseText    = await response.text();

  alert(responseText);
  submitButton.innerText    = "Submit";
  submitButton.disabled     = false;
}

/**
 * Helper function to calculate position in a codemirror instance.
 * Takes in a character position given by JS-interpreter and
 * calculates its line and character position in a codemirror instance.
 * Returns position as a {line: num, ch: num} object as needed by codemirror.
 **/
function calculatePosition(charPosition) {
  let doc = codeMirror.getDoc();

  for (let i = 0; i < doc.lineCount(); ++i) {
    // Adds + 1 to account for newline character
    let currentLineLength = doc.getLine(i).length + 1;

    if (currentLineLength >= charPosition) {
      return {line: i, ch: charPosition};
    } else {
      charPosition -= currentLineLength;
    }
  }
}

/**
 * Highlights code section that the interpreter is currently parsing.
 **/
function highlightCode(interpreter) {
  let start = 0;
  let end = 0;

  if (interpreter.stateStack.length) {
    let node    = interpreter.stateStack[interpreter.stateStack.length - 1].node;
    start       = node.start;
    end         = node.end;
  }

  start = calculatePosition(start);
  end   = calculatePosition(end);

  if (lastMarking)
    lastMarking.clear();
  lastMarking = codeMirror.getDoc().markText(start, end, {className: 'highlighted'});
}
