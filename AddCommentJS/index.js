getToken = require('./getToken');
getListId = require('./getListId');
postComment = require('./postComment');
getSentiment = require('./getSentiment');

module.exports = function (context, req) {
    context.log('AddComment1() called');

    var token = null;

    if (req.body && 
        req.body.siteId &&
        req.body.comment) {

           var username = getUsername(req);
           var sentiment = "unknown";

            getSentiment(req.body.comment).then(s => {
                context.log('Have sentiment');
                sentiment = s;
                return getToken();
            }).then(t => {
                context.log('Have token');
                token = t;
                return getListId(token, req.body.siteId);
            }).then(listId => {
                context.log('Have list ID');
                let comment = `${req.body.comment} (${sentiment}) (${username})`
                return postComment(token, req.body.siteId, listId, comment);
            }).then(resp => {

                context.res = {
                    // status: 200, /* Defaults to 200 */
                    body: {
                        message: `POSTED on behalf of ${username}`
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

    var result = "unknown user";

    var x = req.headers['x-ms-client-principal'];
    if (x) {
        var b = new Buffer(x, 'base64');
        var y = b.toString('ascii');
        var z = JSON.parse(y);

        for (var c in z.claims) {
        let claim = z.claims[c];
        if (claim.typ == "name") {
                result = claim.val;
            }
        }
    }
    return result;

}