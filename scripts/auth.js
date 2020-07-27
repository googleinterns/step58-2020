const SIGNIN_LINK_ID       = 'signin-link'
const SIGNOUT_LINK_ID      = 'signout-link';
const PROFILE_CONTAINER_ID = 'profile-link';
const DEFAULT_PATH = '/'
const CLIENT_ID = '1044127873768-lqem54d3ke8hfanpakvb9f88ptlmton4.apps.googleusercontent.com';

let auth2;

window.addEventListener('load', function() {
  const username = getCookieValue('username');
  if (username) {
    toggleNavLinks(username);
  }
});

function init() {
  gapi.load('auth2', function() {
    // Retrieve the singleton for the GoogleAuth library and set up the client.
    auth2 = gapi.auth2.init({
      client_id: CLIENT_ID,
    });
  });

  if (!getCookieValue('token')) {
    gapi.signin2.render(SIGNIN_LINK_ID, {
      'onsuccess': onSignIn,
    });
  }
}

async function onSignIn(googleUser) {
  // expiration is set in the backend after verifying
  setCookie('token', googleUser.getAuthResponse().id_token);

  const response = await fetch('/sign-in');

  if (response.status === 203) {
    const username = await response.text();
    toggleNavLinks(username);
  } else {
    const user = await response.json();
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('registerForm').addEventListener('submit', formSubmit);
    $('#registerModal').modal('show');
  }
}
 
async function signOut() {
  await auth2.signOut();
  deleteCookie('username');
  deleteCookie('token');
  toggleNavLinks();
}

async function formSubmit(event) {
  event.preventDefault();
  const form = event.target;

  // Bootstrap client-side validation
  if (form.checkValidity()) {
    const formData = new FormData(form);
    const response = await fetch('/register', {method: 'POST', body: formData});

    // Server-side validation for username availability
    if (response.status === 403) {
      form.classList.remove('was-validated');
      document.getElementById('username').classList.add('is-invalid');
      document.getElementById('invalid-feedback').innerText = await response.text();
    } else {
      document.getElementById('username').classList.remove('is-invalid');
      document.getElementById('username').classList.add('is-valid');
      $('#registerModal').modal('hide');
      toggleNavLinks(getCookieValue('username'));
    }
  } else {
    form.classList.add('was-validated');
  }
}

function toggleNavLinks(username) {
  const signInLink  = document.getElementById(SIGNIN_LINK_ID);
  const signOutLink = document.getElementById(SIGNOUT_LINK_ID);
  const profileLink = document.getElementById(PROFILE_CONTAINER_ID);

  if (username) {
    signInLink.hidden  = true;
    signOutLink.hidden = false;
    profileLink.href   = `/users/${username}`;
    profileLink.hidden = false;
  } else {
    init();
    signInLink.hidden  = false;
    signOutLink.hidden = true;
    profileLink.hidden = true;
  }
}

/**
 * Helper function to set a cookie value. If path is not provided,
 * defaults to '/' (global).
 * @param {string} key 
 * @param {string} value 
 * @param {string} path 
 */
function setCookie(key, value, path) {
  path = path || DEFAULT_PATH;
  document.cookie = `${key}=${value};path=${path}`
}

/**
 * Helper function to delete a cookie.
 * @param {string} key 
 * @param {string} path 
 */
function deleteCookie(key, path) {
  path = path || DEFAULT_PATH;
  document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path}`
}

/**
 * Helper function to get value associated with a cookie.
 * @param {string} key 
 * @returns {string|undefined} 
 */
function getCookieValue(key) {
  const cookie = document.cookie.split('; ').find(row => row.startsWith(key)); 
  return cookie ? cookie.split('=')[1] : undefined;
}
