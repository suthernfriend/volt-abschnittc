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
