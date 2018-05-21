var settings = require('./settings');
var msrestAzure = require('ms-rest-azure');
var KeyVault = require('azure-keyvault');

// In-memory cache will work as long as Azure
// keeps this instance of the app service running
global.cache = [];

module.exports = function getSecret(context, knownValue, secretName) {

    return new Promise((resolve, reject) => {
        
        if (knownValue) {
            // If here, caller already had the value, just return it
            context.log(`Secret ${secretName} was already known`);
            resolve(knownValue);
        } else if (cache[secretName]) {
            // If here, the value was in cache, just return it
            context.log(`Found ${secretName} in local cache`);
            resolve(cache[secretName]);
        } else {
            // If here, get the value from KeybVault
            context.log(`Getting secret ${secretName} from Key Vault`);

            // Get a token to call Key Vault
            msrestAzure.loginWithAppServiceMSI({resource: 'https://vault.azure.net'})
            .then((credentials) => {

                // If here, we have a token to call Key Vault
                context.log('Got credentials for Key Vault');
                const keyVaultClient = new KeyVault.KeyVaultClient(credentials);
                return (keyVaultClient.getSecret(settings().KEYVAULT_URL,
                secretName, ''));
            })
            .then((secret) => {
                // If here we got the secret! Cache it and resolve
                context.log(`Got secret ${secretName}`);
                cache[secretName] = secret.value;
                resolve(secret.value);
            })
            .catch((error) => {
                // If here, it's a bad day in paradise
                context.log('ERROR - ' + error);
                reject(error);
            })
        }
    });
}
