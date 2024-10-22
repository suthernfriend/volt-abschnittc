export type AssistantProviderStepType = string;

export interface AssistantProviderStep {
	title(): string;

	explanation(): string;

	type(): AssistantProviderStepType;

	no(): number;
}

export interface AssistantProvider {
	getSteps(): AssistantProviderStepType[];

	getStep(name: string): AssistantProviderStep;
}

export interface AssistantProviderImplFile {
	order: AssistantProviderStepType[];
	steps: {
		[k in AssistantProviderStepType]: {
			title: string;
			explanation: string;
		}
	};
}

export interface AssistantProviderImplOptions {
	file: AssistantProviderImplFile;
}

export class AssistantProviderImpl implements AssistantProvider {

	constructor(private options: AssistantProviderImplOptions) {
	}

	getSteps(): AssistantProviderStepType[] {
		return [...this.options.file.order];

	}

	getStep(name: string): AssistantProviderStep {
		if (!this.options.file.steps.hasOwnProperty(name))
			throw new Error(`assistant.yaml file invalid. Missing: ${name}`);

		let i = 1;
		for (const step of this.options.file.order) {
			if (step === name)
				break;
			i++;
		}

		return {
			no: () => i,
			title: () => this.options.file.steps[name].title,
			explanation: () => this.options.file.steps[name].explanation,
			type: () => name
		};
	}
}
