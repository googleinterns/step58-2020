import { idToken } from './auth.js';

const CODE_AREA_CLASS       = 'code-area';
const EMAIL_CLASS           = 'email';

window.addEventListener('load', function() {
  const emails = document.getElementsByClassName(EMAIL_CLASS);

  for (let email of emails) {
    const buttonElement = document.getElementById(email.innerText + '-button');
    buttonElement.addEventListener('click', function() {
      displayCode(email.innerText)
    }, {once: true});
  }
});

function setupCodeArea(elementId, code) {
  const element = document.getElementById(elementId);
  element.value = code;

  const codeMirror = CodeMirror.fromTextArea(element, {
    mode: 'javascript',
    readOnly: true,
    lineNumbers: true,
  });
}

async function displayCode(email) {
  const payload         = new Blob([JSON.stringify({authToken: idToken, email: email})], {type: 'application/json'});
  const response        = await fetch(`${location.pathname}`, {method: 'POST', body: payload})
  const responseJson    = await response.json();
  const code            = responseJson[0].code;
  const elementId       = email + '-code-area';
  setupCodeArea(elementId, code);
}
