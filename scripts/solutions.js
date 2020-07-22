import { idToken } from './auth.js';

const CODE_AREA_JQUERY_CLASS = '.code-area';
const USERNAME_CLASS = 'username';
const RANK_CLASS = 'rank-selection';

window.addEventListener('load', function() {
  setupCodeDisplay();
  setupRankButtons();
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

function setupCodeDisplay() {
  const usernames = document.getElementsByClassName(USERNAME_CLASS);

  for (let username of usernames) {
    const buttonElement = document.getElementById(username.innerText + '-button');
    buttonElement.addEventListener('click', function() {
      displayCode(username.innerText)
    }, {once: true});
  }
}

function setupRankButtons() {
  const rankButtons = document.getElementsByClassName(RANK_CLASS);

  for (let button of rankButtons) {
    button.addEventListener('click', function() {
      window.location.href = `${location.pathname}?rank=${button.value}`;
    });
  }
}

