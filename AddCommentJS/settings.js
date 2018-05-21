module.exports = () => {
    var settings = settings ? settings :
        {
            AUTH_URL: "https://login.microsoftonline.com/",
            GRAPH_URL: "https://graph.microsoft.com/",
            TENANT: process.env["TENANT"],
            CLIENT_ID: process.env["CLIENT_ID"],
            // Client secret - if stored in settings
            CLIENT_SECRET: process.env["CLIENT_SECRET"],
            // Client secret name - if stored in Key Vault
            CLIENT_SECRET_NAME: process.env["CLIENT_SECRET_NAME"],
            LISTNAME: "Comments",
            KEYVAULT_URL: process.env["KEYVAULT_URL"],
            TEXT_ANALYTICS_URL: process.env["TEXT_ANALYTICS_URL"],
            // Text analytics key - if stored in settings
            TEXT_ANALYTICS_KEY: process.env["TEXT_ANALYTICS_KEY"],
            // Text analytics secret name - if stored in Key Vault
            TEXT_ANALYTICS_SECRET_NAME: process.env["TEXT_ANALYTICS_SECRET_NAME"]
        };
    return settings;
}