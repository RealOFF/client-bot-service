const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
   chatId: String,
   tags: Array,
   username: String,
}, {collection: 'user'});

module.exports = UserSchema;