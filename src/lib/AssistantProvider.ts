export interface AssistantStep {
	title(): string;

	explanation(): string;

	actions(): {};
}

export interface AssistantProvider {
	getSteps(): AssistantStep[];
}

export interface AssistantProviderImplFile {
	steps: {
		title: string;
		explanation: string;
		actions: {
			link: string;
			alternative: string;
		}[];
	}[];
}

export interface AssistantProviderImplOptions {
	file: AssistantProviderImplFile;
}

export class AssistantProviderImpl implements AssistantProvider {

	constructor(private options: AssistantProviderImplOptions) {
	}

	getSteps(): AssistantStep[] {
		return this.options.file.steps.map(value => {
			return {
				title(): string {
					return value.title;
				},
				actions(): {} {
					return {};
				},
				explanation(): string {
					return value.explanation;
				}
			}
		})
	}
}