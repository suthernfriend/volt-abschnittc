export interface MessageStreamMetaExit {
	type: "exit";
}

export interface MessageStreamMetaSetObject {
	type: "set-object";
	name: string;
}

export type MessageStreamMeta = MessageStreamMetaExit | MessageStreamMetaSetObject;

export type MessageStreamCallback<T> = {
	(type: "meta", data: MessageStreamMeta): void;
	(type: "data", data: T): void;
};

export interface MessageStreamOutgoingMessageMeta {
	type: "meta";
	data: MessageStreamMeta;
}

export interface MessageStreamOutgoingMessageData<T> {
	type: "data";
	data: T;
}

export type MessageStreamOutgoingMessage<T> = MessageStreamOutgoingMessageMeta | MessageStreamOutgoingMessageData<T>;

export interface MessageStream<I, O> {
	onMessage(callback: MessageStreamCallback<I>): void;

	sendMessage(type: MessageStreamOutgoingMessage<O>): void;

	onOpen(callback: () => void): void;

	onClose(callback: () => void): void;

	close(): void;
}
