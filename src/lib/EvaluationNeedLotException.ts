import type { EvaluationResultNeedLot } from "@/lib/EvaluationResult";
import { deepCopy } from "@/lib/utility";

export class EvaluationNeedLotException extends Error {
	constructor(public details: Partial<EvaluationResultNeedLot>) {
		super("Need lot");
	}
}

export function attemptAndCatchLotException<T>(fn: () => T, opts: Partial<EvaluationResultNeedLot>): T {
	try {
		return fn();
	} catch (e) {
		if (e instanceof EvaluationNeedLotException) {
			const details = {
				...deepCopy(e.details),
				...opts,
			};

			throw new EvaluationNeedLotException(details);
		} else {
			throw e;
		}
	}
}
