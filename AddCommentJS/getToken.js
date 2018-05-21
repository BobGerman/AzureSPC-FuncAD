var adal = require('adal-node');
var settings = require('./settings');

// getToken() - Return promise of auth token for app
// permission (client credentials flow) to elevate permission
module.exports = function getToken() {

  return new Promise((resolve, reject) => {

    const authContext = new adal.AuthenticationContext(
      settings().AUTH_URL + settings().TENANT);
 
    // TODO: Store client secret in KeyVault just as
    // the Text Analytics key is ... to keep the code
    // simple it's just in settings here
    authContext.acquireTokenWithClientCredentials(
      settings().GRAPH_URL, settings().CLIENT_ID, settings().CLIENT_SECRET, 
      (err, tokenRes) => {
        if (err) {
          reject(err); 
        } else {
          resolve(tokenRes.accessToken);
        }
    });
  });
}