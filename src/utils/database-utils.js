const {Schema, createConnection} = require('mongoose');

async function createDBConnection(collectionName, dbURL, schemaConfig) {
    try {
        const schema = new Schema(schemaConfig, {collection: collectionName});
        const connection = await createConnection(
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
    createConnection: createDBConnection
};
