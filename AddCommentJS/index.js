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
            getSentiment(context, req.body.comment),
            // Get OAuth token for app permission
            getToken(context).then(t => {
                context.log('Have token');
                token = t;
                // Get list ID
                return getListId(token, req.body.siteId);
            })
        ]).then(results => {
            // If here we have both a sentiment and a token+listID
            context.log('Have sentiment, token, and list ID');
            const sentiment = results[0];
            const listId = results[1];
            const comment = `${req.body.comment} (${sentiment}) (${username})`

            // Now post the comment
            return postComment(token, req.body.siteId, listId, comment);
        }).then(resp => {
            // All successful! Return success
            context.log('Successfully posted');
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
            context.log(`Error encountered ${error}`);
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

// "Does your dog bite?"
// "No"
// "Ouch!"
// "That is not my dog."
//   - from The Pink Panther Strikes Again

// Even though Vittorio says "don't peek..."
// (see http://bit.ly/VittorioSaysDontPeek)
//
// he's referring to clients not peeking in
// access tokens, which are really none of their
// business. Access tokens' soul purpose is to relay
// information authorization info to the resource server!
//
// HOWEVER this is not a client token.
// This is an App Service specific header injected by
// Easy Auth, so it's OK to parse the token to get
// the user information inside.
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

        for (let claim of callerTokenObject.claims) {
            if (claim.typ == "name") {
                    result = claim.val;
            }
        }
    }
    return result;

}