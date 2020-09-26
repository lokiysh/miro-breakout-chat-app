export interface Message {
	text: string
	author: string
	timestamp: Date
    roomId: string
}

export type MessageHandler = (msg: Message) => void

export type EmitHandler = (error: any, response: any) => void

export interface ChatSettings {
	roomId: string
	name: string
	messageHandler: MessageHandler
}

export interface ChatController {
	sendMessage: (msg: Message) => void
}
