import { type Ref, ref, watch } from "vue";
import { container } from "@/lib/Container";
import type { MessageStream, MessageStreamMessage } from "@/lib/MessageStream";

function deepCopy<T extends object>(obj: T): T {
	if (Array.isArray(obj)) {
		return obj.map((v) => deepCopy(v)) as T;
	}

	if (typeof obj !== "object") {
		return obj;
	}

	const copy: any = {};

	for (const key in obj) {
		copy[key] = deepCopy(obj[key]);
	}

	return copy;
}

function deepEquals<T extends object>(a: T, b: T): boolean {
	if (a === b) {
		return true;
	}

	if (typeof a !== "object" || typeof b !== "object") {
		return false;
	}

	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);

	if (aKeys.length !== bKeys.length) {
		return false;
	}

	for (const key of aKeys) {
		if (!b.hasOwnProperty(key)) {
			return false;
		}

		if (!deepEquals(a[key], b[key])) {
			return false;
		}
	}

	return true;
}

/**
 * This function tries to apply the changes from source to target. The algorithm should try
 * to create as few changes as possible, it not only uses overwrite, but also shift and push
 * @param target the target array, which should be changed. (target is equal to source after this function)
 * @param source the source array, which should be applied to the target array
 * @param path a path which can be used for debugging purposes
 */
function applyArrayDiff<T>(target: T[], source: T[], path?: string) {
	path = path || "";

	const targetLength = target.length;
	const sourceLength = source.length;

	if (targetLength === 0 && sourceLength === 0) {
		return;
	}

	if (targetLength === 0) {
		console.log(`Updating ${path} (empty -> ${source})`);
		target.push(...source);
		return;
	}

	if (sourceLength === 0) {
		console.log(`Updating ${path} (${target} -> empty)`);
		target.splice(0, targetLength);
		return;
	}

	let i = 0;
	while (i < targetLength && i < sourceLength) {
		const targetType = Array.isArray(target[i]) ? "array" : typeof target[i];
		const sourceType = Array.isArray(source[i]) ? "array" : typeof source[i];

		if (targetType !== sourceType) {
			console.log(`Updating ${path}[${i}] (${target[i]} -> ${source[i]})`);
			target[i] = deepCopy(source[i]);
		} else {
			if (targetType === "array") {
				applyArrayDiff(target[i], source[i], path + "[" + i + "]");
			} else if (targetType === "object") {
				applyDiff(target[i], source[i], path + "[" + i + "]");
			} else {
				if (target[i] !== source[i]) {
					console.log(`Updating ${path}[${i}] (${target[i]} -> ${source[i]})`);
					target[i] = deepCopy(source[i]);
				}
			}
		}

		i++;
	}

	if (i < targetLength) {
		console.log(`Deleting ${path}[${i}]`);
		target.splice(i, targetLength - i);
	} else if (i < sourceLength) {
		console.log(`Adding ${path}[${i}] (${source[i]})`);
		target.push(deepCopy(source[i]));
		i++;
	}

	while (i < sourceLength) {
		console.log(`Adding ${path}[${i}] (${source[i]})`);
		target.push(deepCopy(source[i]));
		i++;
	}

}

function applyDiff<T extends object>(target: T, source: T, path?: string) {
	path = path || "";

	for (const key in source) {
		if (!target.hasOwnProperty(key)) {
			console.log(`Updating ${path}.${key} (${target[key]} -> ${source[key]})`);
			target[key] = source[key];
			continue;
		}

		const targetType = Array.isArray(target[key]) ? "array" : typeof target[key];
		const sourceType = Array.isArray(source[key]) ? "array" : typeof source[key];

		if (targetType !== sourceType) {
			console.log(`Updating ${path}.${key} (${target[key]} -> ${source[key]})`);
			target[key] = deepCopy(source[key]);
		} else {
			if (targetType === "array") {
				applyArrayDiff(target[key], source[key], path + "." + key);
			} else if (targetType === "object") {
				applyDiff(target[key], source[key], path + "." + key);
			} else {
				if (target[key] !== source[key]) {
					console.log(`Updating ${path}.${key} (${target[key]} -> ${source[key]})`);
					target[key] = deepCopy(source[key]);
				}
			}
		}
	}

	for (const key in target) {
		if (!(key in source)) {
			console.log(`Deleting ${key}`);
			delete target[key];
		}
	}
}

export function remoteReactive<T>(name: string, defaultValue: T): [Ref<T>, Ref<{ ready: boolean }>] {
	const shadow: { obj: T } = {
		obj: undefined,
	};

	const obj = ref<T>();

	const statusRef = ref<{
		ready: boolean;
	}>({
		ready: false,
	});

	const api = container.voltToolsIopApi();
	const authManager = container.authManager();

	let stream: MessageStream<any> | undefined = undefined;

	function remotelyChanged(remoteObj: T) {
		// 1. check if there really was a change
		if (deepEquals(remoteObj, shadow.obj)) {
			return;
		}

		// 2. apply diff
		if (!shadow.obj) shadow.obj = deepCopy(remoteObj);
		else applyDiff(shadow.obj, remoteObj, "shadow.obj");

		if (!obj.value) obj.value = deepCopy(shadow.obj);
		else applyDiff(obj.value, shadow.obj, "obj.value");
	}

	function locallyChanged() {
		// 1. check if local has changed from shadow
		if (deepEquals(obj.value, shadow.obj)) {
			return;
		}

		// 1a. send to server
		if (!shadow.obj) shadow.obj = deepCopy(obj.value);
		else applyDiff(shadow.obj, obj.value, "shadow.obj");
		stream?.sendMessage({
			type: "data",
			data: shadow.obj,
		});
	}

	watch(
		obj,
		(value) => {
			locallyChanged();
		},
		{ deep: true },
	);

	api.v1SynchronizedObject(name, authManager.getToken()).then((ns) => {
		stream = ns;

		ns.onMessage((data: MessageStreamMessage<any>) => {
			if (data.type === "catch-up") {
				remotelyChanged(data.data);
				statusRef.value.ready = true;
			}
			if (data.type === "data") {
				remotelyChanged(data.data);
			} else if (data.type === "created") {
				obj.value = defaultValue;
				locallyChanged();
				console.log("Now ready");
				statusRef.value.ready = true;
			}
		});
	});

	return [obj, statusRef];
}
