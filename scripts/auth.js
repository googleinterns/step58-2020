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

    //Sending the ID to the server with an HTTPS POST request
    const xhr = new XMLHttpRequest();
    //xhr.open('POST', 'https://cloud-ad-step-2020.uc.r.appspot.com');
    xhr.open('POST', 'https://8080-f7dcdea0-3cc5-4401-86b4-0bac092a4a2e.us-central1.cloudshell.dev/')
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {
    console.log('Signed in as: ' + xhr.responseText);
    };
    xhr.send('idtoken=' + id_token);
}

function signOut(){
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function(){
        console.log('User signed out.');
    });
}