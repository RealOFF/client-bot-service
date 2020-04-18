const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
   id: {type: String, required: true, unique: true},
   tags: {type: Array, required: true},
   name: {type: String},
   date: {type: Date, required: true, default: new Date()},
}, {collection: 'user'});

async function initUserModel() {
   const dbURL = process.env.MONGODB_URL_USERS;
   let User;
   try {
      const connection = await mongoose.createConnection(dbURL,  {useNewUrlParser: true,  useUnifiedTopology: true});
      console.log('User DB connected');
      return connection.model('user', UserSchema);
   } catch(error) {
      console.error('Connection DB error');
   }
}

module.exports = {initUserModel};
