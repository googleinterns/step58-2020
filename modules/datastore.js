const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore({
  projectId: 'cloud-ad-step-2020',
});

/**
 * Saves a new entity given a key and a hashmap of parameters.
 * If key defines only the Kind of the enitity, a new entity will be created.
 * If key defines both the Kind and the id of an existing entity, it will be updated.
 *
 * Creates a new function for datastore to avoid code repetition.
 **/
datastore.store = async function(key, parameters) {
  const entityKey = datastore.isKey(key) ? key : datastore.key(key);

  const entity = {
    key : entityKey,
    data: parameters
  };

  try {
    await datastore.save(entity);
  } catch(error) {
    throw error;
  }
}

module.exports = datastore;
