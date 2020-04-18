const mongoose = require('mongoose');
const {Schema} = mongoose;

const MessageSchema = new Schema({
    text: String,
    date: Date,
    url: String,
    channel: String,
    tags: Array,
    salary: {value: Number, currency: String, period: String}
}, {collection: 'message'});

async function initMessageModel() {
    const dbURL = process.env.MONGODB_URL_MESSAGES;
    try {
       const connection = await mongoose.createConnection(dbURL,  {useNewUrlParser: true,  useUnifiedTopology: true});
       console.log('Messages DB connected');
       return connection.model('message', MessageSchema);
    } catch(error) {
       console.error('Connection DB error');
    }
 }

module.exports = {initMessageModel};
