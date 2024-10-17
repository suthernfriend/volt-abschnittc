export interface Vector2d {
	x(): number;

	y(): number;

	width(): number;

	height(): number;

	length(): number;

	scale(factor: number): Vector2d;

	add(other: Vector2d): Vector2d;
	
	toString(): string;

	negate(): Vector2d;
}

class Vector2dImpl implements Vector2d {
	constructor(
		private readonly _x: number,
		private readonly _y: number,
	) {}

	height(): number {
		return this._y;
	}

	length(): number {
		return Math.sqrt(this._x * this._x + this._y * this._y);
	}

	width(): number {
		return this._x;
	}

	x(): number {
		return this._x;
	}

	y(): number {
		return this._y;
	}

	negate(): Vector2d {
		return new Vector2dImpl(-this._x, -this._y);
	}

	add(other: Vector2d): Vector2d {
		return new Vector2dImpl(this._x + other.x(), this._y + other.y());
	}

	scale(factor: number): Vector2d {
		return new Vector2dImpl(this._x * factor, this._y * factor);
	}

	toString(): string {
		return `(${this._x}, ${this._y})`;
	}
}

export function vector2d(x: number, y: number): Vector2d {
	return new Vector2dImpl(x, y);
}

export function root(): Vector2d {
	return new Vector2dImpl(0, 0);
}
