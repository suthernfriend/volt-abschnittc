import type { MessageStream, MessageStreamCallback, MessageStreamOutgoingMessage } from "@/lib/MessageStream";

export interface VoltToolsIopApiOptions {
	endpoint: string;
	webSocketEndpoint: string;
}

export class VoltToolsIopApi {
	constructor(private options: VoltToolsIopApiOptions) {}

	public async v1UseCredential(credential: string): Promise<{
		token: string;
	}> {
		console.log("credential", credential);

		const resp = await fetch(`${this.options.endpoint}/api/v1/use-credential`, {
			body: JSON.stringify({ credential: credential }),
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
			credentials: "omit",
		});

		const code = resp.status;
		if (code !== 200) {
			throw new Error(`Failed to validate token: ${code}`);
		} else {
			return await resp.json();
		}
	}

	messageStream<I, O>(url: string): Promise<MessageStream<I, O>> {
		const webSocket = new WebSocket(url);

		let onMessageCb: MessageStreamCallback<T> | undefined = undefined;
		let onCloseCb: (() => void) | undefined = undefined;
		let onOpenCb: (() => void) | undefined = undefined;

		const messageStream: MessageStream<T, T> = {
			onMessage(callback: MessageStreamCallback<T>) {
				onMessageCb = callback;
			},
			sendMessage(type: MessageStreamOutgoingMessage<T>) {
				webSocket.send(JSON.stringify(type));
			},
			onOpen(callback: () => void) {
				onOpenCb = callback;
			},
			onClose(callback: () => void) {
				onCloseCb = callback;
			},
			close() {},
		};

		webSocket.onopen = (ev: Event) => {
			onOpenCb?.();
		};

		webSocket.onerror = (ev: Event) => {
			webSocket.close();
		};

		webSocket.onclose = (ev: CloseEvent) => {
			onCloseCb?.();
		};

		return messageStream;
	}

	async v1SynchronizedObject<T>(name: string, init: () => T): Promise<MessageStream<T, T>> {
		const stream = await this.messageStream<T, T>(`${this.options.webSocketEndpoint}/api/v1/synchronized-object`);

		stream.onOpen(() => {
			stream.sendMessage({
				type: "meta",
				data: {
					type: "set-object",
					name,
				},
			});
		});
	}
}
