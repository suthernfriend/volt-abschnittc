import { VoltToolsIopApi } from "@/lib/VoltToolsIopApi";
import { AuthManager } from "@/lib/AuthManager";
import { BallotGeneratorImpl } from "@/lib/BallotGeneratorImpl";
import { type TextFile, TextProviderImpl } from "@/lib/TextProvider";

console.log(import.meta.env);

async function voltToolsIopApi() {
	return once("voltToolsIopApi", async () => {
		return new VoltToolsIopApi({
			endpoint: import.meta.env.VITE_VOLT_TOOLS_IOP_API_ENDPOINT,
			webSocketEndpoint: import.meta.env.VITE_VOLT_TOOLS_IOP_WS_ENDPOINT
		});
	});
}

async function authManager() {
	return once("authManager", async () => {
		return new AuthManager({
			api: await voltToolsIopApi(),
			storageKey: "volt-tools-iop-token"
		});
	});
}

async function textProvider() {
	return once("textProvider", async () => {
		return new TextProviderImpl({
			file: (await import("@/text/texts.yaml")).default as TextFile
		});
	});
}

async function ballotGenerator() {
	return once("ballotGenerator", async () => {
		return new BallotGeneratorImpl({
			textProvider: await textProvider()
		});
	});
}

const instances: { [name: string]: any } = [];

async function once<T>(name: string, creator: () => Promise<T>): Promise<T> {
	if (!instances.hasOwnProperty(name)) {
		console.log("Creating", name);
		instances[name] = await creator();
	}
	return instances[name];
}

export interface Container {
	voltToolsIopApi(): Promise<VoltToolsIopApi>;

	authManager(): Promise<AuthManager>;

	ballotGenerator(): Promise<BallotGeneratorImpl>;
}

export default {
	voltToolsIopApi: () => voltToolsIopApi(),
	authManager: () => authManager(),
	ballotGenerator: () => ballotGenerator()
} as Container;
