const lambdaLocal = require('lambda-local');
const lambdaFunc = require('../Alexa/index.js');
const Discover = require('./libs/alexa-smarthome/sample_messages/Discovery/Discovery.request.json');

lambdaLocal.execute({
  event: Discover,
  lambdaFunc: lambdaFunc,
  profilePath: '~/.aws/credentials',
  profileName: 'default',
  timeoutMs: 30000,
}).then( (result) => {
  console.log(result);
}).catch( (error) => {
  console.log(error);
});
