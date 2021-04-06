const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatSchema = new Schema({
  senderId: { type: String, required: true },
  recipientId: { type: String, required: true },
  roomId: { type: String, required: true },
  text: { type: String, required: true },
});

const Chat = mongoose.model('chat', chatSchema)

module.exports = Chat