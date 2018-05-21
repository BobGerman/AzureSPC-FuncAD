var request = require('request');

// postComment() - Returns a promise to post the comment
// with the provided token
module.exports = function postComment(token, siteId, listId, comment) {

  return new Promise((resolve, reject) => {

    const url = 'https://graph.microsoft.com/v1.0/sites/' +
           siteId + '/lists/' + listId + '/items';

    request.post(url, {
        'auth': { 'bearer': token },
        'headers': {'Content-Type': 'application/json' },
        'body': "{ 'fields': { 'Title': '" + comment + "'} }"
    }, (error, response, body) => {

      if (!error && response && response.statusCode == 201) {

        // If here we were successful
        const result = JSON.parse(response.body);
        resolve(result);

      } else {
        
        // If here something went wrong, reject with an error
        // message
        if (error) {
            reject(error);
        } else {
          let b = JSON.parse(response.body);
          reject(`${b.error.code} - ${b.error.message} - ${token}`);
        }
      }

    });
  });
}