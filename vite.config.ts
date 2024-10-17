import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import vitePlugingArraybuffer from "vite-plugin-arraybuffer";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue(), vueDevTools(), vitePlugingArraybuffer()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
});
