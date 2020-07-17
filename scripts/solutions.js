import { idToken } from './auth.js';

const CODE_AREA_JQUERY_CLASS  = '.code-area';
const USERNAME_CLASS          = 'username';

window.addEventListener('load', function() {
  const usernames = document.getElementsByClassName(USERNAME_CLASS);

  for (let username of usernames) {
    const buttonElement = document.getElementById(username.innerText + '-button');
    buttonElement.addEventListener('click', function() {
      displayCode(username.innerText)
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

  const collapseAreas = $(CODE_AREA_JQUERY_CLASS).on('shown.bs.collapse', function() {
    codeMirror.refresh();
  });
}

async function displayCode(username) {
  const payload         = new Blob([JSON.stringify({authToken: idToken, username: username})], {type: 'application/json'});
  const response        = await fetch(`${location.pathname}`, {method: 'POST', body: payload})
  if (!response.ok) {
    alert('Solve this problem to view others\' solutions.');
    return;
  }
  const responseJson    = await response.json();
  const code            = responseJson[0].code;
  const elementId       = username + '-code-area';
  setupCodeArea(elementId, code);
}
