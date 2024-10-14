export interface VoltToolsIopApiOptions {
	endpoint: string;
}

export class VoltToolsIopApi {
	constructor(private options: VoltToolsIopApiOptions) {}

	public async v1UseCredential(credential: string) : Promise<{
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

	v1SynchronizedObjects() {}
}
