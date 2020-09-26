const mongoose = require('mongoose')
var config = require('../config')

const Schema = mongoose.Schema
const CHAT_DB = config['CHAT_DB']
const ChatSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    roomId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    versionKey: false 
})
ChatSchema.index({roomId : 1})
module.exports = Chat = mongoose.model(CHAT_DB, ChatSchema)