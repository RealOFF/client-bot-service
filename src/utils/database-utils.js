const mongoose = require('mongoose');

async function createConnection(collectionName, dbURL, schemaConfig) {
    try {
        const schema = new mongoose.Schema(schemaConfig, {collection: collectionName});
        const connection = await mongoose.createConnection(
            dbURL,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
        console.log(collectionName + ' DB connected');
        return connection.model(collectionName, schema);
    } catch(error) {
        console.error('DB connection error');
    }
}

module.exports = {
    createConnection
};
