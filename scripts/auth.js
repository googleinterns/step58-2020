//THIS IS JUST THE GOOGLE SIGN IN CODE
function onSignIn(googleUser) {

    // The ID token you need to pass to your backend:
    const id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);
    const name = profile.getName();
    const email = profile.getEmail();
    //To send the information to the server
    var user = new Object();
    user.name = name;
    user.email = email;
    
    //const request = new Request("/user", {method: "POST", body: JSON.stringify(user)}); 
    fetch("/user", {method: "POST", body: JSON.stringify(user)});
}
 
function signOut(){
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function(){
        console.log('User signed out.');
    });
}