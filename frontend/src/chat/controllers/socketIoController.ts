import io from 'socket.io-client'

import {CHAT_HOST, CHAT_OPTIONS} from '../../config'

import type {ChatSettings, ChatController, Message} from '../interfaces/chat'

const initChat = ({roomId, name, messageHandler}: ChatSettings) => {
	const socket = io(CHAT_HOST, CHAT_OPTIONS)

	socket.emit('join', roomId, name, () => {})

	socket.on('chat message', messageHandler)

	return {
		sendMessage: (msg: Message) => {
			socket.emit('chat message', msg, () => {})
		},
	} as ChatController
}

export default initChat
