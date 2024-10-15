import { type Ref, ref, watch } from "vue";
import { container } from "@/lib/Container";

export function remoteReactive<T>(name: string, init: () => T): Ref<T> {
	const obj = ref();

	const api = container.voltToolsIopApi();

	const stream = await api.v1SynchronizedObject(name);

	const { pause, resume } = watch(obj, (value) => {
		stream.sendMessage({
			type: "data",
			data: value,
		});
	});

	stream.onMessage((type, data) => {
		if (type === "data") {
			pause();
			obj.value = data;
			resume();
		}
	});

	return obj;
}
