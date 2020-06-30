//THIS IS JUST THE GOOGLE SIGN IN CODE
function onSignIn(googleUser) {
    // Useful data for your client-side scripts:
    const profile = googleUser.getBasicProfile();
    console.log("ID: " + profile.getId()); // Don't send this directly to server!
    console.log('Full Name: ' + profile.getName());
    console.log("Email: " + profile.getEmail());

    // The ID token you need to pass to your backend:
    const id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);
}
 
function signOut(){
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function(){
        console.log('User signed out.');
    });
}