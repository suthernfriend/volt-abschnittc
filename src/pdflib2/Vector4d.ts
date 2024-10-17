import { vector2d, type Vector2d } from "@/pdflib2/Vector2d";

export interface Vector4d {
	x(): number;

	y(): number;

	width(): number;

	height(): number;

	size(): Vector2d;

	topLeft(): Vector2d;

	topRight(): Vector2d;

	bottomLeft(): Vector2d;

	bottomRight(): Vector2d;

	area(): number;

	circumference(): number;
	
	toString(): string;
}

export function vector4d(topLeft: Vector2d, size: Vector2d): Vector4d;
export function vector4d(x: number, y: number, width: number, height: number): Vector4d;

export function vector4d(a1: number | Vector2d, a2: number | Vector2d, a3?: number, a4?: number): Vector4d {
	if (typeof a1 === "number" && typeof a2 === "number" && typeof a3 === "number" && typeof a4 === "number") {
		return new Vector4dImpl(a1, a2 as number, a3 as number, a4 as number);
	} else if (typeof a1 === "object" && typeof a2 === "object") {
		return new Vector4dImpl(a1.x(), a1.y(), a2.width(), a2.height());
	} else {
		throw new Error("Invalid arguments");
	}
}

class Vector4dImpl implements Vector4d {
	constructor(
		private readonly _x: number,
		private readonly _y: number,
		private readonly _width: number,
		private readonly _height: number,
	) {}

	toString(): string {
		return `[${this.topLeft().toString()}, ${this.size().toString()}]`;
	}

	area(): number {
		return this._width * this._height;
	}

	bottomLeft(): Vector2d {
		return vector2d(this._x, this._y + this._height);
	}

	bottomRight(): Vector2d {
		return vector2d(this._x + this._width, this._y + this._height);
	}

	circumference(): number {
		return 2 * (this._width + this._height);
	}

	height(): number {
		return this._height;
	}

	length(): number {
		return Math.sqrt(this._width * this._width + this._height * this._height);
	}

	topLeft(): Vector2d {
		return vector2d(this._x, this._y);
	}

	topRight(): Vector2d {
		return vector2d(this._x + this._width, this._y);
	}

	width(): number {
		return this._width;
	}

	x(): number {
		return this._x;
	}

	y(): number {
		return this._y;
	}

	size(): Vector2d {
		return vector2d(this._width, this._height);
	}
}
