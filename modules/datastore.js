// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore');

const projectId = 'cloud-ad-step-2020';

// Creates a client
const datastore = new Datastore({
  projectId: projectId,
});

// The kind for the new entity
const kind = 'User';
// The name for the new entity
const name = 'sampleUser1';
//The email for the new entity
const email = 'user@gmail.com'
// The Cloud Datastore key for the new entity
const userKey = datastore.key([kind, name, email]);

// Prepares the new entity
const user = {
  key: userKey,
  data: {
    description: 'ID Key',
  },
};

// Saves the entity
datastore
  .save(user)
  .then(() => {
    console.log(`Saved ${user.key.name}: ${user.data.description}`);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });