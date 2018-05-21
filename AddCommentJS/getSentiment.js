var settings = require('./settings');
var request = require('request');
var msrestAzure = require('ms-rest-azure');
var KeyVault = require('azure-keyvault');
const KEYVAULT_URL = 'https://spclogicappvault.vault.azure.net/';

module.exports = function getSentiment(context, comment) {

    // Always resolve - don't want to fail everything
    // if we can't get the sentiment
    return new Promise((resolve) => {

        getServiceKey(context)
        .then((key) => {
            context.log('Have key ' + key);

            const endpoint = settings().TEXT_ANALYTICS_URL;
            //        const key = settings().TEXT_ANALYTICS_KEY;
            
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

    function getServiceKey(context) {

        context.log('Getting key');
        return new Promise((resolve, reject) => {
            msrestAzure.loginWithAppServiceMSI()
            .then((credentials) => {
                context.log('Got credentials');
                const keyVaultClient = new KeyVault.KeyVaultClient(credentials);
                return (keyVaultClient.getSecret(KEYVAULT_URL, 'TextAnalyticsKey', ''));
            })
            .then((secret) => {
                context.log('Got secret');
                resolve(secret.value);
            })
            .catch((error) => {
                context.log('ERROR - ' + error);
                reject(error);
            })
        });
    }
}