//THIS IS JUST THE GOOGLE SIGN IN CODE
function onSignIn(googleUser) {
    // Useful data for your client-side scripts:
    const profile = googleUser.getBasicProfile();
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