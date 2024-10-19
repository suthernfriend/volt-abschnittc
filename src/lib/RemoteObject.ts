import { type Ref, ref, watch } from "vue";
import Container from "@/lib/Container";
import type { MessageStream, MessageStreamMessage } from "@/lib/MessageStream";

function deepCopy<T>(obj: T): T {
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

function arrayEquals<T>(a: T[], b: T[]): boolean {
	if (a.length !== b.length) {
		return false;
	}

	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}

	return true;
}

function deepEquals<T>(a: T, b?: T): boolean {
	if (a === b) {
		return true;
	}

	if (typeof a !== "object" || typeof b !== "object") {
		return false;
	}

	if (Array.isArray(a)) {
		if (!Array.isArray(b)) return false;

		return arrayEquals(a, b);
	} else if (Array.isArray(b)) {
		return false;
	}

	if (a === null) {
		return b === null;
	} else if (b === null) {
		return false;
	}

	for (const key in a) {
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
		const targetV = target[i];
		const sourceV = source[i];

		const targetType = typeof targetV;
		const sourceType = typeof sourceV;

		if (targetType !== sourceType) {
			console.log(`Updating ${path}[${i}] (${targetV} -> ${sourceV})`);
			target[i] = deepCopy(sourceV);
		} else {
			if (Array.isArray(target[i]) && Array.isArray(sourceV)) {
				applyArrayDiff(target[i] as any, sourceV, path + "[" + i + "]");
			} else if (targetType === "object") {
				applyDiff(target[i] as any, sourceV, path + "[" + i + "]");
			} else {
				if (targetV !== sourceV) {
					console.log(`Updating ${path}[${i}] (${targetV} -> ${sourceV})`);
					target[i] = deepCopy(sourceV);
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

function applyDiff<T>(target: T, source: T, path?: string) {
	path = path || "";

	if (target === undefined || source === undefined) {
		throw new Error("Undefined values are not allowed");
	} else if (typeof target !== "object" || typeof source !== "object") {
		throw new Error("Only objects are allowed");
	} else if (target === null || source === null) {
		throw new Error("Null values are not allowed");
	}

	for (const key in source) {
		if (!target.hasOwnProperty(key)) {
			console.log(`Updating ${path}.${key} (${target[key]} -> ${source[key]})`);
			target[key] = source[key];
			continue;
		}
		const targetType = typeof target[key];
		const sourceType = typeof source[key];

		if (targetType !== sourceType) {
			console.log(`Updating ${path}.${key} (${target[key]} -> ${source[key]})`);
			target[key] = deepCopy(source[key]);
		} else {
			if (Array.isArray(target[key]) && Array.isArray(source[key])) {
				applyArrayDiff(target[key] as any, source[key], path + "." + key);
			} else if (targetType === "object") {
				applyDiff(target[key] as any, source[key], path + "." + key);
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

export function remoteReactive<T extends object>(
	name: string,
	defaultValue: T,
): [
	Ref<T | undefined>,
	Ref<{
		ready: boolean;
	}>,
] {
	const shadow: { obj?: T } = {
		obj: undefined,
	};

	const obj = ref<T>();

	const statusRef = ref<{
		ready: boolean;
	}>({
		ready: false,
	});

	let stream: MessageStream<any> | undefined = undefined;

	function remotelyChanged(remoteObj: T) {
		if (remoteObj === undefined && shadow.obj === undefined) {
			return;
		} else if (deepEquals(remoteObj, shadow.obj)) {
			return;
		} else if (remoteObj === undefined && shadow.obj !== undefined) {
			shadow.obj = undefined;
		} else if (remoteObj !== undefined && shadow.obj === undefined) {
			shadow.obj = deepCopy(remoteObj);
		} else {
			shadow.obj = deepCopy(remoteObj);
		}

		if (!obj.value) obj.value = deepCopy(shadow.obj);
		else if (!shadow.obj) obj.value = shadow.obj;
		else applyDiff(obj.value, shadow.obj, "obj.value");
	}

	function locallyChanged() {
		// 1. check if local has changed from shadow
		if (deepEquals(obj.value, shadow.obj)) {
			return;
		}

		if (obj.value === undefined && shadow.obj === undefined) {
			return;
		} else if (obj.value === undefined && shadow.obj !== undefined) {
			shadow.obj = undefined;
		} else if (obj.value !== undefined && shadow.obj === undefined) {
			shadow.obj = deepCopy(obj.value);
		} else {
			applyDiff(shadow.obj, obj.value, "shadow.obj");
		}

		stream?.sendMessage({
			type: "data",
			data: shadow.obj,
		});
	}

	watch(
		obj,
		() => {
			locallyChanged();
		},
		{ deep: true },
	);


	const tryLaunch = () => {
		Container.authManager().then((authManager) => {
			if (!authManager.isAuthenticated())
				setTimeout(tryLaunch, 1000);
			else
				launch().catch((e) => {
					console.error(e);
					setTimeout(tryLaunch, 1000);
				});
		});
	}

	async function launch() {
		const api = await Container.voltToolsIopApi();
		const authManager = await Container.authManager();
		const token = authManager.getToken();

		api.v1SynchronizedObject(name, token).then((ns) => {
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
	}

	setTimeout(tryLaunch, 0);

	return [obj, statusRef];
}
