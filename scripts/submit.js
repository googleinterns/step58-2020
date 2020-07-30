const SUBMIT_MODAL_ID = 'submitProblemModal';
const SUBMIT_FORM_ID = 'submitProblemForm';
const opts = {
  mode: 'javascript',
  lineNumbers: true,
  autoCloseBrackets: true,
};

let code;
let tests;
let solution;
let codeAreas;

$(`#${SUBMIT_MODAL_ID}`).on('shown.bs.modal', function(e) {
  setupCodeAreas();
  setupValidation(document.getElementById(SUBMIT_FORM_ID));
});

/**
 * Converts plain text areas to CodeMirror editors.
 */
function setupCodeAreas() {
  code = CodeMirror.fromTextArea(document.getElementById('code'), opts);
  tests = CodeMirror.fromTextArea(document.getElementById('tests'), opts);
  solution = CodeMirror.fromTextArea(document.getElementById('solution'), opts);

  codeAreas = [code, tests, solution];
}

/**
 * Adds listener to validate form passed as input.
 * @param {HTMLFormElement} form
 */
function setupValidation(form) {
  form.addEventListener('submit', function(event) {
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    codeAreas.forEach(validateCodeArea);

    form.classList.add('was-validated');
  });
}

/**
 * Validates that a code area has text and toggles
 * the .is-invalid class.
 * @param {CodeMirror} codeArea
 */
function validateCodeArea(codeArea) {
  const textAreaClassList = codeArea.getTextArea().classList;
  codeArea.getValue() === '' ?
      textAreaClassList.add('is-invalid') :
      textAreaClassList.remove('is-invalid');
}
