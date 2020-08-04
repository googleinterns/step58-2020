const {Datastore} = require('@google-cloud/datastore');
const PROBLEMS_KIND = 'Problem';

const datastore = new Datastore({
  projectId: 'cloud-ad-step-2020',
});

/**
 * Saves a new entity given a key and a hashmap of parameters.
 * If key defines only the Kind of the entity, a new entity will be created.
 * If key defines both the Kind and the id of an existing entity, it will be updated.
 *
 * Creates a new function for datastore to avoid code repetition.
 **/
datastore.store = async function(key, parameters) {
  const entityKey       = datastore.isKey(key) ? key : datastore.key(key);
  parameters.timestamp  = new Date(); 

  const entity = {
    key : entityKey,
    data: parameters
  };

  await datastore.save(entity);
}

/**
 * Counts number of entities given a kind and filter object.
 * Filter object should specify property, operator, and value.
 */
datastore.countKind = async function countKind(kind, filter) {
  const query = datastore.createQuery(kind)
      .select('__key__')
      .filter(filter.property, filter.operator, filter.value);
  const [entities] = await datastore.runQuery(query);

  return entities.length;
}

/**
 * Gets problem according to the id given.
 * Utilizes parseInt() as integer sent through request
 * may have its typing wrongly inferred by Node.
 */
datastore.getProblem = async function getProblem(id) {
  let query = datastore
    .createQuery(PROBLEMS_KIND)
    .filter('id', '=', parseInt(id));

  let [problems] = await datastore.runQuery(query);

  if (problems.length === 0) {
    query = datastore
      .createQuery(PROBLEMS_KIND)
      .filter('__key__', '=', datastore.key([PROBLEMS_KIND, parseInt(id)]));
    [problems] = await datastore.runQuery(query);
  }

  return problems[0];
}

module.exports = datastore;
