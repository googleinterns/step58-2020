//Authentication code
const express = require('express');
const metadata = require('gcp-metadata');
const {OAuth2Client} = require('google-auth-library');

const app = express();
const oAuth2Client = new OAuth2Client();

// Cache externally fetched information for future invocations
let aud;

async function audience() {
  if (!aud && (await metadata.isAvailable())) {
    let project_number = await metadata.project('numeric-project-id');
    let project_id = await metadata.project('project-id');

    aud = '/projects/' + project_number + '/apps/' + project_id;
  }

  return aud;
}

async function validateAssertion(assertion) {
  if (!assertion) {
    return {};
  }

  // Check that the assertion's audience matches ours
  const aud = await audience();

  // Fetch the current certificates and verify the signature on the assertion
  const response = await oAuth2Client.getIapPublicKeys();
  const ticket = await oAuth2Client.verifySignedJwtWithCertsAsync(
    assertion,
    response.pubkeys,
    aud,
    ['https://cloud.google.com/iap']
  );
  const payload = ticket.getPayload();

  // Return the two relevant pieces of information
  return {
    email: payload.email,
    sub: payload.sub,
  };
}

app.get('/', async (req, res) => {
  const assertion = req.header('X-Goog-IAP-JWT-Assertion');
  let email = 'None';
  try {
    const info = await validateAssertion(assertion);
    email = info.email;
  } catch (error) {
    console.log(error);
  }
  res
    .status(200)
    .send(`Hello ${email}`)
    .end();
});


// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

//--------------------------------------------------------------//
//THIS IS THE END OF THE AUTHENTICATION CODE

//Nick's code
'use strict';

const PORT      = process.env.PORT || 8080;

const path      = require('path'); 
const express   = require('express');
const app       = express();

app.use('/html', express.static(path.join(__dirname, 'html')))
app.use('/scripts', express.static(path.join(__dirname, 'scripts')))
app.use('/stylesheets', express.static(path.join(__dirname, 'stylesheets')))
app.use('/lib', express.static(path.join(__dirname, 'lib')))

app.get('/solve', function(request, response){
  response.sendFile('html/solve.html', { root: __dirname });
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
module.exports = app;
