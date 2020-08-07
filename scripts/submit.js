const SUBMIT_MODAL_ID = 'submitProblemModal';
const SUBMIT_FORM = document.getElementById('submitProblemForm');
const opts = {
  mode: 'javascript',
  lineNumbers: true,
  autoCloseBrackets: true,
};

let code;
let tests;
let solution;
let codeAreas;

// Only set up code areas once to avoid multiple code mirror instances
$(`#${SUBMIT_MODAL_ID}`).one('shown.bs.modal', function(e) {
  setupCodeAreas();
});

$(`#${SUBMIT_MODAL_ID}`).on('shown.bs.modal', function(e) {
  setupValidation(SUBMIT_FORM);
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
  form.addEventListener('submit', async function(event) {
    event.preventDefault();

    if (form.checkValidity() && validateCodeAreas(codeAreas)) {
      const formData = new FormData(form);
      const response = await fetch('/problems', {method: 'POST', body: formData});
      if (!response.ok) {
        alert(await response.text());
      } else {
        $(`#${SUBMIT_MODAL_ID}`).modal('hide');
        window.location = '/problems?list=user';
      }
    }

    form.classList.add('was-validated');
  });
}

/**
 * Validates that each code area has text and toggles
 * the .is-invalid class for any that don't.
 * @param {CodeMirror[]} codeAreas
 */
function validateCodeAreas(codeAreas) {
  let valid = true;

  for (const codeArea of codeAreas) {
    const textAreaClassList = codeArea.getTextArea().classList;
    if (codeArea.getValue() === '') {
      textAreaClassList.add('is-invalid');
      valid = false;
    } else {
      textAreaClassList.remove('is-invalid');
    }
  }

  return valid;
}
