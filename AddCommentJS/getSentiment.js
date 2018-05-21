var settings = require('./settings');
var request = require('request');

module.exports = function getSentiment(comment) {

    // Always resolve - don't want to fail everything if we can't get this
    return new Promise((resolve) => {
    
        const endpoint = settings().TEXT_ANALYTICS_URL;
        const key = settings().TEXT_ANALYTICS_KEY;

        if (endpoint && key) {
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
            
              request.post(endpoint + "/sentiment", {
                'headers': headers,
                'body': JSON.stringify(payload)
            }, (error, response, body) => {
                if (!error && response && response.statusCode == 200) {
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
                        resolve ("Sentiment unknown");
                    }
                } else {
                    reject("Sentiment unknown");
                }
            });
        } else {
            resolve("Sentiment unknown");
        }
    });
}