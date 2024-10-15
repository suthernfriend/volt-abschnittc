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
	data: T[];
}

export type MessageStreamMessage<T> = MessageStreamMessageSetObject | MessageStreamMessageCreated |
	MessageStreamMessageExit | MessageStreamMessageData<T> | MessageStreamCatchUp<T>;

export function isMessageStreamMessageSetObject<T>(message: MessageStreamMessage<T>): message is MessageStreamMessageSetObject {
	return message.type === "set-object" && message.name.length > 0;
}

export function isMessageStreamMessageExit<T>(message: MessageStreamMessage<T>): message is MessageStreamMessageExit {
	return message.type === "exit";
}

export function isMessageStreamMessageCreated<T>(message: MessageStreamMessage<T>): message is MessageStreamMessageCreated {
	return message.type === "created";
}

export function isMessageStreamMessageData<T>(message: MessageStreamMessage<T>): message is MessageStreamMessageData<T> {
	return message.type === "data" && message.data !== undefined;
}

export function isMessageStreamCatchUp<T>(message: MessageStreamMessage<T>): message is MessageStreamCatchUp<T> {
	return message.type === "catch-up" && message.data !== undefined;
}

export interface MessageStream<T> {
	onMessage(callback: MessageStreamCallback<T>): void;

	sendMessage(type: MessageStreamMessage<T>): void;

	onOpen(callback: () => void): void;

	onClose(callback: () => void): void;

	close(): void;
}
