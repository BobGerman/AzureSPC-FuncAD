var settings = require('./settings');
var request = require('request');
var getSecret = require('./getSecret');

module.exports = function getSentiment(context, comment) {

    // Always resolve - don't want to fail everything
    // if we can't get the sentiment
    return new Promise((resolve) => {

        getSecret(context, settings().TEXT_ANALYTICS_KEY, settings().TEXT_ANALYTICS_SECRET)
        .then((key) => {
            context.log('Have key ' + key);

            const endpoint = settings().TEXT_ANALYTICS_URL;
            
            if (endpoint && key) {
                // Header includes the cognitive services API key
                const headers = {
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": key
                };
                const payload = {
                    "documents": [
                        {
                        "language": "en",
                        "id": "1",
                        "text": comment
                        }
                    ]
                };
                
                // Make the call to cognitive services
                request.post(endpoint + "/sentiment", {
                    'headers': headers,
                    'body': JSON.stringify(payload)
                }, (error, response, body) => {
                    if (!error && response && response.statusCode == 200) {
    
                        // If here we got a successful response
                        // Get the sentiment number and translate to
                        // text we can use in the comment
                        const result = JSON.parse(response.body);
                        if (result.documents[0]) {
                            const score = result.documents[0].score;
                            if (score < 0.25) {
                                resolve("feeling unhappy");
                            } else if (score > 0.75) {
                                resolve("feeling happy");
                            } else {
                                resolve("feeling neutral");
                            }
                        } else {
                            // Something went wrong - just leave it unknown
                            resolve ("Sentiment unknown");
                        }
                    } else {
                        // Something went wrong - just leave it unknown
                        reject("Sentiment unknown");
                    }
                });
            } else {
                // Something went wrong - just leave it unknown
                resolve("Sentiment unknown");
            }
        })
    });
}