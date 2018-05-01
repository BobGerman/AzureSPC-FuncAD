var adal = require('adal-node');
var settings = require('./settings');

module.exports = function getToken() {

  return new Promise((resolve, reject) => {
    const authContext = new adal.AuthenticationContext(
      settings().AUTH_URL + settings().TENANT);
 
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