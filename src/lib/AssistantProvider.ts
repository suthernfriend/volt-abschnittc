export type AssistantProviderStepType =
	"app-configuration" |
	"link-step-candidates-import" |
	"candidates-double-check" |
	"link-print-ballots" |
	"execute-vote" |
	"numbering-ballots" |
	"input-ballots" |
	"control-input" |
	"commit-result" |
	"display-result" |
	"lot" |
	"commit-candidates-2" |
	"print-ballots-2" |
	"execute-vote-2" |
	"count-votes-2" |
	"input-result-2" |
	"commit-result-2" |
	"display-result-2" |
	"repeat-runoff" |
	"commit-acceptance" |
	"display-full-list" |
	"export";

export interface AssistantProviderStep {
	title(): string;

	explanation(): string;

	type(): AssistantProviderStepType;
}

export interface AssistantProvider {
	getSteps(): AssistantProviderStep[];
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

	getSteps(): AssistantProviderStep[] {

		const out: AssistantProviderStep[] = [];

		for (const order of this.options.file.order) {

			if (!this.options.file.steps.hasOwnProperty(order))
				throw new Error(`assistant.yaml file invalid. Missing: ${order}`);

			out.push({
				title: () => this.options.file.steps[order].title,
				explanation: () => this.options.file.steps[order].explanation,
				type: () => order
			});
		}

		return out;
	}
}