import { VoltToolsIopApi } from "@/lib/VoltToolsIopApi";
import { AuthManager } from "@/lib/AuthManager";

console.log(import.meta.env);

const voltToolsIopApi = new VoltToolsIopApi({
	endpoint: import.meta.env.VITE_VOLT_TOOLS_IOP_API_ENDPOINT,
	webSocketEndpoint: import.meta.env.VITE_VOLT_TOOLS_IOP_WS_ENDPOINT,
});


const authManager = new AuthManager({
	api: voltToolsIopApi,
	storageKey: "volt-tools-iop-token",
});

export const container = {
	voltToolsIopApi: () => voltToolsIopApi,
	authManager: () => authManager,
};
