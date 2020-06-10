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

   async init(dbURL) {
      this.connection = await createConnection(this.collectionName, dbURL, this.schemaConfig);
   }

   async getByTags(tags) {
      tags = tags.map(el => el.toLowerCase());
      const messages = await this.connection.find({tags: {$in: tags}});
      return messages;
   }
}

module.exports = {Message};
