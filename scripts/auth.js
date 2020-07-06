//THIS IS JUST THE GOOGLE SIGN IN CODE
function onSignIn(googleUser) {

    // The ID token you need to pass to your backend:
    const id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);
    const name = profile.getName();
    const email = profile.getEmail();
    //To send the information to the server
    const request = new Request("/addUser?name=" + name + "&email=" + email, {method: "POST"}); 
    fetch(request);
}
 
function signOut(){
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function(){
        console.log('User signed out.');
    });
}