const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')
const config = require('../config')

const Schema = mongoose.Schema
const CHAT_DB = config['CHAT_DB']

var signing_key = process.env.SIGNING_KEY
var encrypt_key = process.env.ENCRYPTION_KEY

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
ChatSchema.plugin(encrypt, { encryptionKey: encrypt_key, signingKey: signing_key, excludeFromEncryption: ['roomId'] })
module.exports = Chat = mongoose.model(CHAT_DB, ChatSchema)