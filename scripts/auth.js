//THIS IS JUST THE GOOGLE SIGN IN CODE
function onSignIn(googleUser) {
    // Useful data for your client-side scripts:
    const profile = googleUser.getBasicProfile();
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