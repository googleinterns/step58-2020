const datastore = require('../modules/datastore.js');
const assert = require('assert');
const cp = require('child_process');

describe('Datastore', async() => {
  it('should store a new entity if given a type', async() => {
    const script = cp.exec(`gcloud config set project cloud-ad-step-2020;
    gcloud beta emulators datastore start --no-store-on-disk --consistency=1`);

    script.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    script.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    (async() => {
      console.log('here');
    try{
      await datastore.store('Test', {'property1': 'value'});
      console.log('stored!');
    } catch(error) {
      console.err(error);
    }
  })();
});
