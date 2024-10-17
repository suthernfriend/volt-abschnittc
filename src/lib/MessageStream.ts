export type MessageStreamCallback<T> = {
	(setObject: MessageStreamMessageSetObject): void;
	(exit: MessageStreamMessageExit): void;
	(data: MessageStreamMessageData<T>): void;
};

export interface MessageStreamMessageSetObject {
	type: "set-object";
	name: string;
}

export interface MessageStreamMessageExit {
	type: "exit";
}

export interface MessageStreamMessageCreated {
	type: "created";
}

export interface MessageStreamMessageData<T> {
	type: "data";
	data: T;
}

export interface MessageStreamCatchUp<T> {
	type: "catch-up";
	data: T;
}

export type MessageStreamMessage<T> = MessageStreamMessageSetObject | MessageStreamMessageCreated |
	MessageStreamMessageExit | MessageStreamMessageData<T> | MessageStreamCatchUp<T>;

export interface MessageStream<T> {
	onMessage(callback: MessageStreamCallback<T>): void;

	sendMessage(type: MessageStreamMessage<T>): void;

	onOpen(callback: () => void): void;

	onClose(callback: () => void): void;

	close(): void;
}
