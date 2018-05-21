var adal = require('adal-node');
var settings = require('./settings');
var getSecret = require('./getSecret');

// getToken() - Return promise of auth token for app
// permission (client credentials flow) to elevate permission
module.exports = function getToken(context) {

  return new Promise((resolve, reject) => {

    // Get the ADAL client
    const authContext = new adal.AuthenticationContext(
      settings().AUTH_URL + settings().TENANT);
 
    // Get the client secret
    getSecret(context, settings().CLIENT_SECRET, 
                       settings().CLIENT_SECRET_NAME)
    .then((secret) => {
      // If here we have the client secret, go ahead and get
      // the token
      authContext.acquireTokenWithClientCredentials(
        settings().GRAPH_URL, settings().CLIENT_ID, secret, 
        (err, tokenRes) => {
          if (err) {
            reject(err); 
          } else {
            resolve(tokenRes.accessToken);
          }
      });
    })
  });
}