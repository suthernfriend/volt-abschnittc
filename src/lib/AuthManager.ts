import type { VoltToolsIopApi } from "@/lib/VoltToolsIopApi";

export interface AuthManagerOptions {
	api: VoltToolsIopApi;
	storageKey: string;
}

export class AuthManager {
	private token: string | null = null;

	constructor(private options: AuthManagerOptions) {
		this.loadFromStorage();
	}

	public saveToStorage() {
		if (this.token) {
			localStorage.setItem(this.options.storageKey, this.token);
		} else {
			localStorage.removeItem(this.options.storageKey);
		}
	}

	static decodeUtf8Base64(response: string): string {
		return decodeURIComponent(
			atob(response)
				.split("")
				.map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
				.join(""),
		);
	}

	public isAuthenticated() {
		return this.token !== null;
	}

	public getToken() {
		return this.token;
	}

	public payload(): {
		sub: string;
		name: string;
	} {
		if (this.token) {
			const parts = this.token.split(".");
			if (parts.length === 3) {
				const tk = JSON.parse(AuthManager.decodeUtf8Base64(parts[1]));
				console.log(tk);
				return tk;
			}
		}

		throw new Error("No valid token");
	}

	public loadFromStorage() {
		this.token = localStorage.getItem(this.options.storageKey) || null;
	}

	public async useCredential(credential: string) {
		const resp = await this.options.api.v1UseCredential(credential);
		this.token = resp.token;
		this.saveToStorage();
	}

	clear() {
		this.token = null;
		this.saveToStorage();
	}
}
