const {createConnection} = require('../utils/database-utils');

class Message {
   collectionName = 'message';
   schemaConfig = {
      text: String,
      date: Date,
      url: String,
      channel: String,
      tags: Array,
      salary: {
         value: Number,
         currency: String,
         period: String
      }
   };
   connection = {};
   connectionPromise = {};

   async init(dbURL) {
      let resolveConnectionPromise;
      this.connectionPromise = new Promise((resolve) => resolveConnectionPromise = resolve);
      this.connection = await createConnection(this.collectionName, dbURL, this.schemaConfig);
      resolveConnectionPromise();
   }

   async getByTags(tags) {
      await this.connectionPromise;

      tags = tags.map(el => el.toLowerCase());
      const messages = await this.connection.find({tags: {$in: tags}});
      return messages;
   }
}

module.exports = {Message};
