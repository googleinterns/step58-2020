// Imports the Google Cloud client library
const {Datastore} = require('@google-cloud/datastore');
 
const projectId = 'cloud-ad-step-2020';
 
// Creates a client
const datastore = new Datastore({
  projectId: projectId,
});
 
/**This is the function for saving user's data
    
 */
async function saveUser(name, email){
    //The kind for the new entity being the user info
    const kind = 'User';
    //The Cloud Datastore key for the new entity
    const userKey = datastore.key([kind, name]);
 
    //Preparing the new entity
    const user = {
        key: userKey,
        data: {
            description: 'User\'s profile information',
            email: email
        },
    };
 
    //Saving the user entity
    datastore
        .save(user)
        .then(() => {
            console.log(`Saved ${user.key.name}: ${user.data.description}, ${user.data.email}`);
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
}
module.exports = saveUser;