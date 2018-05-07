getToken = require('./getToken');
getListId = require('./getListId');
postComment = require('./postComment');

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

                context.res = {
                    // status: 200, /* Defaults to 200 */
                    body: {
                        message: "POSTED " + getUsername(req)
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

function getUsername(req) {
    var x = req.headers['x-ms-client-principal'];
    var b = new Buffer(x, 'base64');
    var y = b.toString('ascii');
    var z = JSON.parse(y);
    var n = "Godot";

    for (var c in z.claims) {
        let claim = z.claims[c];
        if (claim.typ == "name") {
            n = claim.val;
        }
    }

    return n;
}