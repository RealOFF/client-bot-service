const {createConnection} = require('../utils/database-utils');

class User {
   collectionName = 'user';
   schema = {
      id: {
         type: String,
         required: true,
         unique: true
      },
      tags: {
         type: Array,
         required: true
      },
      name: {type: String},
      date: {
         type: Date,
         required: true,
         default: new Date()
      },
   };
   connection = {};
   connectionPromise = {};

   async init(dbURL) {
      let resolveConnectionPromise;
      this.connectionPromise = new Promise((resolve) => resolveConnectionPromise = resolve);
      this.connection = await createConnection(this.collectionName, dbURL, this.schemaConfig);
      resolveConnectionPromise();
   }

   async getById(id, session = {}) {
      await this.connectionPromise;

      id = id.toString();
      const user = session.user;
      if (!user || !user.tags) {
         console.log('Finding user in DB');
         const user = await this.connection.findOne({id});
         session.user = user;
      }
      if (session.user && (!session.user.newTags || !session.user.newTags.length)) {
         session.user.newTags = session.user.tags;
      }
      return session.user;
   }

   async save({username, id}) {
      await this.connectionPromise;

      id = id.toString();
      const isUserExist = !! await this.connection.findOne({id});
      if (isUserExist) {
         return;
      }
      const user = this.connection({
         id,
         name: username,
         tags: [],
      });
      await user.save();
      return user;
   }

   async saveTags (id, newTags) {
      await this.connectionPromise;

      id = id.toString();
      await this.connection.updateOne({id}, {$set: {tags: newTags}});
  }
}

module.exports = {User};
