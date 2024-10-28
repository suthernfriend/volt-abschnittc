import { deepCopy } from "@/lib/utility";
import type { EvaluationResultNeedConfirmation } from "@/lib/EvaluationResult";

export class EvaluationNeedConfirmationException extends Error {
	constructor(public details: Partial<EvaluationResultNeedConfirmation>) {
		super("Need confirmation");
	}
}

export function attemptAndCatchNeedConfirmationException<T>(fn: () => T, opts: Partial<EvaluationResultNeedConfirmation>): T {
	try {
		return fn();
	} catch (e) {
		if (e instanceof EvaluationNeedConfirmationException) {
			const details = {
				...deepCopy(e.details),
				...opts,
			};

			throw new EvaluationNeedConfirmationException(details);
		} else {
			throw e;
		}
	}
}
