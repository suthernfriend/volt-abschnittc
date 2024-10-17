export interface Vector2d {
	x(): number;

	y(): number;

	width(): number;

	height(): number;
}

export function vector2d(x: number, y: number): Vector2d {
	return {
		x: () => x,
		y: () => y,
		width: () => x,
		height: () => y,
	};
}
