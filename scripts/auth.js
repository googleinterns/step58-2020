export let idToken = null; 

// Scope functions to global scope
window.onSignIn = onSignIn;
window.signOut = signOut;

//THIS IS JUST THE GOOGLE SIGN IN CODE
function onSignIn(googleUser) {
    //ID-TOKEN
    idToken = googleUser.getAuthResponse().id_token;
    //To send the information to the server
    const type = new Blob([JSON.stringify({authToken: idToken})], {type : 'application/json'});
    //const request = new Request("/user", {method: "POST", body: JSON.stringify(user)}); 
    fetch("/user", {method: "POST", body: type});
}
 
function signOut(){
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function(){
      idToken = null;
    });
}
