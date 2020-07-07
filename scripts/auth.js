//THIS IS JUST THE GOOGLE SIGN IN CODE
function onSignIn(googleUser) {
<<<<<<< HEAD

    // The ID token you need to pass to your backend:
    const id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);
    const name = profile.getName();
    const email = profile.getEmail();
=======
    //ID-TOKEN
    var idToken = googleUser.getAuthResponse().id_token;
    console.log(idToken);
>>>>>>> Final changes for the user's datastore.
    //To send the information to the server
    const type = new Blob([JSON.stringify({authToken: idToken})], {type : 'application/json'});
    //const request = new Request("/user", {method: "POST", body: JSON.stringify(user)}); 
    fetch("/user", {method: "POST", body: type});
}
 
function signOut(){
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function(){
        console.log('User signed out.');
    });
}