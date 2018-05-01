var request = require('request');
var settings = require('./settings');

module.exports = function getListId(token, siteId) {

  return new Promise((resolve, reject) => {

    const url = 'https://graph.microsoft.com/beta/sites/' +
           siteId + '/lists';

    request.get(url, {
        'auth': {
            'bearer': token
        }
    }, (error, response, body) => {

        if (!error && response && response.statusCode == 200) {
            const result = JSON.parse(response.body);
            const list = result.value.find((item) => { 
                return item.name == settings().LISTNAME;
            });
         if (list) {
            resolve(list.id);
         } else {
             reject("List not found");
         }
      } else {
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