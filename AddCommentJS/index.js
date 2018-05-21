getToken = require('./getToken');
getListId = require('./getListId');
postComment = require('./postComment');
getSentiment = require('./getSentiment');

// AddComment() - Adds a comment to a SharePoint
// list under elevated permissions of an app identity
module.exports = function (context, req) {

    context.log('AddCommentJS() called');

    let token = null;
    let username = peekAndGetUsername(req);
    let sentiment = "unknown";

    if (req.body && 
        req.body.siteId &&
        req.body.comment) {

        // Get the sentiment and token+list ID in parallel
        Promise.all([
            // Get sentiment from cognitive services
            getSentiment(req.body.comment),
            // Get OAuth token for app permission
            getToken().then(t => {
                context.log('Have token');
                token = t;
                // Get list ID
                return getListId(token, req.body.siteId);
            })
        ]).then(results => {
            // If here we have both a sentiment and a token+listID
            const sentiment = results[0];
            const listId = results[1];
            const comment = `${req.body.comment} (${sentiment}) (${username})`

            // Now post the comment
            return postComment(token, req.body.siteId, listId, comment);
        }).then(resp => {
            // All successful! Return success
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: {
                    message: `POSTED on behalf of ${username}`
                }
            };
            context.done();
        })
        .catch(error => {
            // Error encountered - return failure
            context.res = {
                status: 400,
                body: {
                    "message": "ERROR: " + error
                }
            };
            context.done();
        })
    } else {
        // Missing parameters - return failure
        context.res = {
            status: 400,
            body: {
                message: "Please pass a site ID and comment in the request body"
            }
        };
        context.done();
    }
};

// For demonstration purposes only!
// See http://bit.ly/VittorioSaysDontPeek
//
// I wanted to keep the code simple and show
// that we know the user's identity. Better
// to pass username in as an argument (just as fast
// as this) or, if it's not handy on the client side,
// use on behalf of flow and ask Graph API (extra
// round trip)
function peekAndGetUsername(req) {

    let result = "unknown user";
    const callerTokenBase64 =
        req.headers['x-ms-client-principal'];

    if (callerTokenBase64) {
        const buff =
            new Buffer(callerTokenBase64, 'base64');
        const callerTokenString =
            buff.toString('ascii');
        const callerTokenObject =
            JSON.parse(callerTokenString);

        for (let claim in callerTokenObject.claims) {
        let claim = callerTokenObject.claims[claim];
        if (claim.typ == "name") {
                result = claim.val;
            }
        }
    }
    return result;

}