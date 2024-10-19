import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import VueDevTools from "vite-plugin-vue-devtools";
import VitePluginArraybuffer from "vite-plugin-arraybuffer";
import ViteYaml from "@modyfi/vite-plugin-yaml";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [Vue(), VueDevTools(), VitePluginArraybuffer(), ViteYaml()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
});
