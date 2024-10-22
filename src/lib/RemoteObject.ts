import { type Ref, ref, watch } from "vue";
import Container from "@/lib/Container";
import type { MessageStream, MessageStreamMessage } from "@/lib/MessageStream";
import { applyDiff, deepCopy, deepEquals } from "@/lib/utility";

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
