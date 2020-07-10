export let idToken = null; 

// Scope functions to global scope
window.onSignIn = onSignIn;
window.signOut = signOut;

function onSignIn(googleUser) {
    idToken = googleUser.getAuthResponse().id_token;
}
 
function signOut(){
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function() {
      idToken = null;
    });
}
