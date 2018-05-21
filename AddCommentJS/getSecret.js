var settings = require('./settings');
var msrestAzure = require('ms-rest-azure');
var KeyVault = require('azure-keyvault');

module.exports = function getSecret(context, knownValue, secretName) {

    return new Promise((resolve, reject) => {
        if (knownValue) {
            context.log(`Secret ${secretName} was already known`);
            resolve(knownValue);
        } else {
            context.log(`Getting secret ${secretName}`);
            msrestAzure.loginWithAppServiceMSI({resource: 'https://vault.azure.net'})
            .then((credentials) => {
                context.log('Got credentials');
                const keyVaultClient = new KeyVault.KeyVaultClient(credentials);
                return (keyVaultClient.getSecret(settings().KEYVAULT_URL,
                secretName, ''));
            })
            .then((secret) => {
                context.log('Got secret');
                resolve(secret.value);
            })
            .catch((error) => {
                context.log('ERROR - ' + error);
                reject(error);
            })
        }
    });
}
