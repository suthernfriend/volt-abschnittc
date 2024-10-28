export function downloadFile(dataUrl: string, filename: string) {
	const link = document.createElement("a");
	link.href = dataUrl;
	link.download = filename;
	link.target = "_blank";
	link.click();
	link.remove();
}

export function loadScript(src: string): Promise<Event> {
	return new Promise<Event>((resolve, reject) => {
		const script = document.createElement("script");
		script.src = src;
		script.async = true;
		script.onload = resolve;
		script.onerror = reject;
		document.head.appendChild(script);
	});
}

export function randomString(length: number): string {
	const firstAlphabet = "CFGHJKLMNPRTVWXYZ";
	const alphabet = "1234567890CFGHJKLMNPRTVWXYZ";
	let result = firstAlphabet[Math.floor(Math.random() * firstAlphabet.length)];
	for (let i = 1; i < length; i++) {
		result += alphabet[Math.floor(Math.random() * alphabet.length)];
	}
	return result;
}

export function toParagraphs(text: string): string {
	return text
		.split("\n")
		.map((p) => `<p>${p}</p>`)
		.join("");
}

export function numberFormat(n: number) {
	return n.toFixed(4);
}

export function arraySameContents<T>(a: T[], b: T[]): boolean {
	if (a.length !== b.length) {
		return false;
	}

	for (const item of a) {
		if (!b.includes(item)) {
			return false;
		}
	}

	return true;
}

export function arrayEquals<T>(a: T[], b: T[]): boolean {
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

export function equalsWithEpsilon(a: number, b: number, epsilon: number): boolean {
	return Math.abs(a - b) < epsilon;
}

export function deepCopy<T>(obj: T): T {
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

export function deepEquals<T>(a: T, b?: T): boolean {
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

export function applyDiff<T>(target: T, source: T, path?: string) {
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

export function requireAll<T>(obj: Partial<T>): Required<T> {
	for (const key in obj) {
		if (obj[key] === undefined) {
			throw new Error(`Missing required key: ${key}`);
		}
	}

	return obj as Required<T>;
}
