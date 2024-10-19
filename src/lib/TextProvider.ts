import type { ElectionGender } from "@/lib/Types";

export interface TextProviderGroup {
	get(key: string, gender?: ElectionGender): Resolvable;

	sub(key: string): TextProviderGroup;
}

export interface TextProvider {
	group(name: string): TextProviderGroup;
}

export interface TextFile {
	groups: {
		[group: string]: {
			[keyOrSubgroup: string]: string | {
				male: string;
				female: string;
			} | {
				[key: string]: string | {
					male: string;
					female: string;
				}
			}
		};
	};
}

export interface Resolvable {
	set(key: string, value: string | number): Resolvable;

	get(): string;
}

export interface TextProviderOptions {
	file: TextFile;
}

export class TheResolvable implements Resolvable {

	private replacements: { [source: string] : string } = {}

	constructor(private key: string, private value: string) {
	}

	set(key: string, value: string | number): Resolvable {
		this.replacements[key] = value.toString();
		return this;
	}

	get(): string {

		let value = this.value;

		for (const src in this.replacements) {
			const target = this.replacements[src];

			// replace all occurences of ${src} with target
			const regex = new RegExp("\\$\\{" + src + "\\}", "g");
			const before = value;
			value = value.replace(regex, target);
			console.log(`Replaced ${before} with ${target}`);
		}

		if (value.includes("${")) {
			const missingKeys = value.match(/\$\{([^}]+)\}/g);
			const out = missingKeys ? missingKeys.join(", ") : "";

			throw new Error(`Text ${this. key} is not fully resolved: Missing: ${out}`);
		}

		return value;
	}
}

export class TextProviderImpl implements TextProvider {

	constructor(private options: TextProviderOptions) {
	}

	text(group: string, key: string, gender?: ElectionGender): Resolvable {

		let text: string | { male: string, female: string } = "";
		let str = "";

		if (group.includes(".")) {
			const [g1, subgroup] = group.split(".");

			if (!this.options.file.groups[g1])
				throw new Error(`Group ${g1} not found`);

			if (!this.options.file.groups[g1][subgroup])
				throw new Error(`Subgroup ${subgroup} not found in group ${g1}`);

			text = (this.options.file.groups[g1][subgroup] as {
				[k: string]: string | { male: string, female: string }
			})[key];
		} else {
			text = this.options.file.groups[group][key] as string | { male: string, female: string };
		}

		if (typeof text === "object" && !gender)
			throw new Error(`Text ${group}.${key} is gender parameterized`);
		else if (typeof text === "object") {
			console.log(`Unpacking gender parameterized text ${group}.${key} for gender ${gender}`);
			str = text[gender!];
			console.log(`Now is ${str}`);
		} else {
			str = text;
		}

		if (!text)
			throw new Error(`Text ${group}.${key} not found`);

		if (typeof str !== "string") {
			throw new Error(`Text ${group}.${key} is not a string: ${JSON.stringify(text)}`);
		}

		return new TheResolvable(key, str);
	}

	group(name: string): TextProviderGroup {
		const self = this;
		return {
			get(key: string, gender?: ElectionGender): Resolvable {
				return self.text(name, key, gender);
			},
			sub(key: string): TextProviderGroup {
				return self.group(name + "." + key);
			}
		};
	}
}