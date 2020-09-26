<script lang="ts">
	import {onMount, afterUpdate} from 'svelte'
	import Message from './Message.svelte'

	import type {
		MessageHandler,
		EmitHandler,
		Message as MessageInterface,
		ChatController,
		ChatSettings,
	} from '../../interfaces/chat'

	export let chatFactory: (settings: ChatSettings) => ChatController
	export let roomId: string
	export let name: string

	let newMessageText: string = ''
	let input_ref = null
	let chat_body = null

	let chatController: ChatController = null

	let messages: Array<MessageInterface> = []
	const handleNewMessage: MessageHandler = (msg : MessageInterface) => {
		messages = [...messages, msg]
	}

	const handleMessageSend = () => {
		if (!newMessageText) return
		let message : MessageInterface = {
			text : newMessageText,
			author: name,
			roomId: roomId,
			timestamp: new Date()
		}
		chatController.sendMessage(message)

		newMessageText = ''

		return false
	}

	onMount(() => {
		setTimeout(() => {
			input_ref.focus()
		}, 0)
		chatController = chatFactory({roomId, name, messageHandler: handleNewMessage})
	})

	afterUpdate(() => {
		chat_body.scrollTo(0, chat_body.scrollHeight);
	})
</script>

<style>
	.sidebar__container {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
	}

	.sidebar__header {
		padding: 24px;
		height: 64px;
	}

	.sidebar__body {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: 0 24px;
		min-height: 100%;
	}

	.sidebar__body_container {
		height: calc(100% - 120px);
		overflow: auto;
	}

	.sidebar__footer {
		padding: 0 8px;
	}

	.sidebar__footer input {
		width: 100%;
	}
</style>

<div class="sidebar__container">
	<div class="sidebar__header">
		<span class="miro-h2">Breakout Chat</span>
	</div>
	<div class="sidebar__body_container" bind:this={chat_body}>
		<div class="sidebar__body">
			{#each messages as message}
				<Message {message} />
			{/each}
		</div>
	</div>
	<div class="sidebar__footer">
		<form on:submit|preventDefault={handleMessageSend}>
			<input
				disabled={chatController === null}
				type="text"
				class="miro-input miro-input--primary"
				bind:value={newMessageText}
				placeholder="Type your message here"
				bind:this={input_ref}
			/>
		</form>
	</div>
</div>
