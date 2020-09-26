var express = require('express')
var app = express()
var cors = require('cors')
var http = require('http').Server(app)
var config = require('./config')
var mongoose = require('mongoose')
var io = require('socket.io')(http, config['socketConfig'])
var port = process.env.PORT || 8081

require('dotenv').config()
const DB_HOST = process.env.DB_HOST
const CHAT_DB = config['CHAT_DB']
require('./models/Chats')
const Chat = mongoose.model(CHAT_DB)

var rooms = {}
var roomsCreatedAt = new WeakMap()
var names = new WeakMap()
var roomId
var name

app.use(cors())

const dbConnect = async() => {
	try {
		db = DB_HOST + '/' + CHAT_DB
		await mongoose.connect(db, {
			useCreateIndex: true,
			useNewUrlParser: true,
			useFindAndModify: false,
			useUnifiedTopology: true
		})
		return 1
	} catch (err) {
		console.error(err.message)
	}
}

app.get('/rooms/:roomId', (req, res) => {
	const {roomId} = req.params
	const room = rooms[roomId]

	if (room) {
		res.json({
			createdAt: roomsCreatedAt.get(room),
			users: Object.values(room).map((socket) => names.get(socket)),
		})
	} else {
		res.status(500).end()
	}
})

app.get('/rooms', (req, res) => {
	res.json(Object.keys(rooms))
})

io.on('connection', (socket) => {
	socket.on('join', async (_roomId, _name, callback) => {
		if (!_roomId || !_name) {
			if (callback) {
				callback('roomId and name params required')
			}
			console.warn(`${socket.id} attempting to connect without roomId or name`, {roomId, name})
			return
		}
		if (!dbConnect()) {
			return
		}

		roomId = _roomId
		name = _name

		if (rooms[roomId]) {
			rooms[roomId][socket.id] = socket
		} else {
			rooms[roomId] = {[socket.id]: socket}
			roomsCreatedAt.set(rooms[roomId], new Date())
		}
		socket.join(roomId)

		names.set(socket, name)

		io.to(roomId).emit('system message', `${name} joined ${roomId}`)
		let chats = await Chat.find({"roomId" : roomId}).sort({timestamp : 1})
		for (let i = 0; i < chats.length; i++) {
			io.to(roomId).emit('chat message', chats[i])
		}

		if (callback) {
			callback(null, {success: true})
		}
	})

	socket.on('chat message', async (msg) => {
		try {
			await new Chat({
				author: msg.author,
				text: msg.text,
				roomId: escape(msg.roomId.toString().trim())
			}).save()
			io.to(msg.roomId).emit('chat message', msg)
		} catch (err) {
			console.error(err)
		}
	})

	socket.on('disconnect', () => {
		io.to(roomId).emit('system message', `${name} left ${roomId}`)

		delete rooms[roomId][socket.id]

		const room = rooms[roomId]
		if (!Object.keys(room).length) {
			delete rooms[roomId]
		}
	})
})

http.listen(port, '0.0.0.0', () => {
	console.log('listening on *:' + port)
})
