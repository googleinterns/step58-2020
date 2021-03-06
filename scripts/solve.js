const INITIAL_CODE_ID    = 'initial-code';
const CODE_AREA_ID       = 'code-area';
const CODE_OUTPUT_ID     = 'code-output';
const ANALYSIS_OUTPUT_ID = 'analysis-output';
const RUN_BUTTON_ID      = 'run-button';
const STOP_BUTTON_ID     = 'stop-button';
const SUBMIT_BUTTON_ID   = 'submit-button';
const RESET_BUTTON_ID    = 'reset-button';
const KEYBIND_CLASS      = 'keybind';
const OUTPUT_TAB_ID      = 'output-tab';
const ANALYSIS_TAB_ID    = 'analysis-tab';
const HIDDEN_ATTRIBUTE   = 'hidden';
const NEWLINE            = '\n';
const KEYBIND_KEY        = 'keybind';
const LOADING_BUTTON     = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading...';
const DIFFICULTY_DESC    = 'Halstead difficulty is a metric calculated based on the number of operands and operators in the function. The higher the number, the more difficult a program is to understand (e.g. in a code review).';
const LLOC_DESC          = 'Logical lines of code is a measure of the number of imperative statements in the program.';
const CYCLOMATIC_DESC    = 'Cyclomatic complexity is a measure of the number linearly independent paths through a program.';
const PLOC_DESC          = 'Physical lines of code is a measure of the number of lines in a function or a module.';
const PARAMS_DESC        = 'Number of Parameters metric is a count of the number of parameters to a method. Lower is better.';
const DENSITY_DESC       = 'Cyclomatic Complexity Density metric that simply re-expresses cyclomatic density as a percentage of the logical lines of code.';




let codeMirror;
let outputArea;
let runButton;
let stopButton;
let submitButton;
let resetButton;
let keepRunningCode;
let interpreter;
let lastMarking;

window.addEventListener('load', function() {
  setupCodeMirror();
  setupElements();
  setupKeybind();
});

/**
 * Sets up text editor.
 * Further modification to the text editor should be done here.
 **/
function setupCodeMirror() {
  codeMirror = CodeMirror(document.getElementById(CODE_AREA_ID), {
    value: restoreLocalCode() || document.getElementById(INITIAL_CODE_ID).value,
    keyMap: window.localStorage.getItem(KEYBIND_KEY) || 'default',
    mode:  'javascript',
    gutters: ["CodeMirror-lint-markers"],
    lint: true,
    lineNumbers: true,
    extraKeys: {
      "Ctrl-Space": "autocomplete"
    },
    autoCloseBrackets: true,
  });

  codeMirror.on('change', async function() {
    saveLocalCode();
    await runStaticAnalysis(codeMirror.getValue());
    document.getElementById(ANALYSIS_TAB_ID).click();

    if (lastMarking)
      lastMarking.clear();
  });
}

function setupElements() {
  outputArea    = document.getElementById(CODE_OUTPUT_ID);
  runButton     = document.getElementById(RUN_BUTTON_ID);
  stopButton    = document.getElementById(STOP_BUTTON_ID);
  submitButton  = document.getElementById(SUBMIT_BUTTON_ID)
  resetButton   = document.getElementById(RESET_BUTTON_ID);

  runButton.addEventListener('click', executeCode);
  stopButton.addEventListener('click', stopRunningCode);
  submitButton.addEventListener('click', submitSolution);
  resetButton.addEventListener('click', resetLocalCode);
}

function setupKeybind() {
  const keybindButtons = document.getElementsByClassName(KEYBIND_CLASS);

  for (let button of keybindButtons) {
    button.addEventListener('click', function() {
      codeMirror.setOption('keyMap', button.innerText.toLowerCase());
      window.localStorage.setItem(KEYBIND_KEY, button.innerText.toLowerCase());
    });
  }
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
  document.getElementById(OUTPUT_TAB_ID).click();
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

function generateTooltipHTMLString(title, alignment) {
  let HTMLString = `<button type="button" class="close text-${alignment}" aria-label="Help"
                    data-toggle="tooltip" title="${title}">
                      <span aria-hidden="true">?</span>
                    </button>`
  return HTMLString;
}

async function runStaticAnalysis(code) {
  const response = await fetch('/analysis', {method: 'POST', body: code});
  if (!response.ok) {
    // Allow user to keep coding; errors in their code will be caught during execution
    return;
  }

  const analysis = await response.json();

  JSHINT(code);
  const results = JSHINT.data();
  const unused = results.unused ? results.unused.map(element => element.name) : [];

  const metrics = {
    numFunctions: `Number of functions: ${results.functions.length}`,
    unused: `Unused functions and variables: ${unused.length > 0 ? unused.join(', ') : 'none'}.`,
    cyclomatic: `The total cyclomatic complexity is ${analysis.cyclomatic}.
      ${generateTooltipHTMLString(CYCLOMATIC_DESC, 'right')}`,
    difficulty: `The Halstead difficulty is ${analysis.difficulty}.
      ${generateTooltipHTMLString(DIFFICULTY_DESC, 'right')}`,
    lloc: `${analysis.lloc} logical lines of code.
      ${generateTooltipHTMLString(LLOC_DESC, 'right')}`,
    ploc: `${analysis.ploc} physical lines of code.
      ${generateTooltipHTMLString(PLOC_DESC, 'right')}`,
    params: `The Number of Parameters is ${analysis.params}.
      ${generateTooltipHTMLString(PARAMS_DESC, 'right')}`,
    density: `The total cyclomatic complexity density is ${analysis.density}.
      ${generateTooltipHTMLString(DENSITY_DESC, 'right')}`
  }

  document.getElementById(ANALYSIS_OUTPUT_ID).innerHTML = '';
  for (const metric in metrics) {
    let metricListItem = document.createElement('li');
    metricListItem.innerHTML = metrics[metric];
    metricListItem.className = 'list-group-item';
    document.getElementById(ANALYSIS_OUTPUT_ID).appendChild(metricListItem);
  }
  $('[data-toggle="tooltip"]').tooltip('enable');
}

async function submitSolution() {
  submitButton.disabled     = true;
  submitButton.innerHTML    = LOADING_BUTTON;
  const payload = new Blob([JSON.stringify({code: codeMirror.getValue()})], {type: 'application/json'});

  const response        = await fetch(`${location.pathname}`, {method: 'POST', body: payload})
  const responseText    = await response.text();

  if (response.ok) {
    let solutionUrl = `${location.pathname}` + '/solutions';
    redirectAlert(responseText, solutionUrl);
  } else {
    alert(responseText);
  }

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

/**
 * Saves current code with current location as a key.
 **/
function saveLocalCode() {
  let key   = window.location.href;
  let value = codeMirror.getValue();
  window.localStorage.setItem(key, value);
}

/**
 * Retrieves saved code with current location as a key.
 **/
function restoreLocalCode() {
  let key = window.location.href;
  return window.localStorage.getItem(key);
}

/**
 * Reset initial code of codemirror.
 * Session storage does not need to be handled here as codemirror
 * value change will trigger the local storage update.
 **/
function resetLocalCode() {
  keepRunningCode = false;
  let initialCode = document.getElementById(INITIAL_CODE_ID).value;
  codeMirror.setValue(initialCode);
}

/**
 * Helper function to display message in an alert box
 * that redirects the user to redirectUrl if they click on OK.
 **/
function redirectAlert(message, redirectUrl) {
  if (confirm(message)) {
    window.location = redirectUrl;
  }
}
