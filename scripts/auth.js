export let idToken         = null;

const SIGNIN_LINK_ID       = 'signin-link'
const SIGNOUT_LINK_ID      = 'signout-link';
const PROFILE_CONTAINER_ID = 'profile-link';

// Scope functions to global scope
window.onSignIn = onSignIn;
window.signOut = signOut;

async function onSignIn(googleUser) {
  idToken = googleUser.getAuthResponse().id_token;
  const payload = new Blob([JSON.stringify({authToken: idToken})], {type: 'application/json'});

  const response = await fetch('/sign-in', {method: 'POST', body: payload});

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
 
function signOut() {
  const auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function() {
    idToken = null;
    toggleNavLinks();
  });
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
    signInLink.hidden  = false;
    signOutLink.hidden = true;
    profileLink.hidden = true;
  }
}
