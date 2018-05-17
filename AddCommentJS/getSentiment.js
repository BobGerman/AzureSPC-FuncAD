var settings = require('./settings');
var request = require('request');

module.exports = function getSentiment(comment) {
    return new Promise((resolve, reject) => {
        
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
                            resolve("unhappy");
                        } else if (score > 0.75) {
                            resolve("happy");
                        } else {
                            resolve("neutral");
                        }
                    } else {
                        reject (result.error[0].message);
                    }
                } else {
                    reject(response.statusCode);
                }
            });
        } else {
            resolve("Sentiment unknown");
        }
    });
}