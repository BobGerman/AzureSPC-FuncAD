getToken = require('./getToken');
getListId = require('./getListId');
postComment = require('./postComment');
jwt_decode = require('jwt_decode');

module.exports = function (context, req) {
    context.log('AddComment1() called');

    var token = null;

    if (req.body && 
        req.body.siteId &&
        req.body.comment) {

            getToken().then(t => {
                context.log('Have token');
                token = t;
                return getListId(token, req.body.siteId);
            }).then(listId => {
                context.log('Have list ID');
                return postComment(token, req.body.siteId, listId, req.body.comment);
            }).then(resp => {
                var x = req.headers['Authorization'];
                var y = x.substr(7);

                context.res = {
                    // status: 200, /* Defaults to 200 */
                    body: {
                        message: "POSTED " + y
                    }
                };
                context.done();
            })
            .catch(error => {
                context.res = {
                    status: 400,
                    body: {
                        "message": "ERROR: " + error
                    }
                };
                context.done();
            })
    }
    else {
        context.res = {
            status: 400,
            body: {
                message: "Please pass a site ID and comment in the request body"
            }
        };
        context.done();
    }
};