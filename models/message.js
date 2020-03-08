const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    text: String,
    date: Date,
    url: String,
    channel: String,
    tags: Array,
    salary: {value: Number, currency: String}
}, {collection: 'message'});

module.exports = MessageSchema;