const sdk = require("node-appwrite");

const client = new sdk.Client();

const databases = new sdk.Databases(client);

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_SECRET_KEY);

module.exports = databases;
