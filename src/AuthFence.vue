<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { loadScript } from "@/lib/utility";
import { AuthManager } from "@/lib/AuthManager";
import Container from "@/lib/Container";

const emits = defineEmits<{
	(e: "credential", credential: string): void;
}>();
const props = defineProps<{ clientId: string; domain: string }>();
const buttonRef = ref<HTMLDivElement | null>(null);

declare global {
	interface GoogleAccountsIdInitializeCallbackArg {
		selected_by: string;
		clientId?: string;
		client_id?: string;
		credential: string;
	}

	type GoogleAccountsIdInitializeCallback = (response: GoogleAccountsIdInitializeCallbackArg) => void;

	interface GoogleAccountsIdInitializeOptions {
		client_id: string;
		callback: GoogleAccountsIdInitializeCallback;
		hd: string;
	}

	interface GoogleAccountsId {
		initialize(options: GoogleAccountsIdInitializeOptions): void;

		renderButton(
			element: HTMLDivElement,
			options: {
				theme: string;
				size: string;
				text: string;
				shape: string;
				width: string;
			}
		): void;

		prompt(): void;
	}

	interface Window {
		google: {
			accounts: {
				id: GoogleAccountsId;
			};
		};
	}
}

function handleClientResponse(response: GoogleAccountsIdInitializeCallbackArg) {
	emits("credential", response.credential);
}

onMounted(async () => {
	const authManager = await Container.authManager();
	if (authManager.isAuthenticated()) {
		// do nothing for now
		return;
	}

	await loadScript("https://accounts.google.com/gsi/client");

	window.google.accounts.id.initialize({
		client_id: props.clientId,
		callback: handleClientResponse,
		hd: props.domain
	});
	window.google.accounts.id.renderButton(buttonRef.value!, {
		theme: "outline",
		size: "large",
		text: "login_with",
		shape: "rectangular",
		width: "240px"
	});
	window.google.accounts.id.prompt();
});
</script>

<template>
	<div class="container">
		<div class="mt-5">
			<h1 class="title is-2">Anmeldung erforderlich</h1>
			<div ref="buttonRef"></div>
		</div>
	</div>
</template>

<style scoped></style>
