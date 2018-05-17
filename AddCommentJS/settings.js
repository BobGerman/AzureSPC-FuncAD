module.exports = () => {
    var settings = settings ? settings :
        {
            AUTH_URL: "https://login.microsoftonline.com/",
            GRAPH_URL: "https://graph.microsoft.com/",
            TENANT: process.env["TENANT"],
            CLIENT_ID: process.env["CLIENT_ID"],
            CLIENT_SECRET: process.env["CLIENT_SECRET"],
            LISTNAME: "Comments",
            TEXT_ANALYTICS_URL: process.env["TEXT_ANALYTICS_URL"],
            TEXT_ANALYTICS_KEY: process.env["TEXT_ANALYTICS_KEY"]
        };
    return settings;
}