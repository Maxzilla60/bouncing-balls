import { COLLISION_COEFFICIENT, FPS, GRAVITY_ACCELERATION } from './config';
import { getAccelerationX, getAccelerationY, getAerodynamicForce } from './physicsUtil';
import Point from './Point';

export default class Ball {
	public readonly id: number;
	public readonly radius = 10;
	public readonly color = Ball.randomColor();
	public readonly mass = 10;
	public velocity: Point = { x: 0, y: 0 };

	public position: Point;
	public get area(): number {
		return (Math.PI * this.radius * this.radius) / 1000;
	}

	constructor(position: Point, id: number) {
		this.position = { ...position };
		this.id = id;
	}

	public static randomColor(): string {
		// https://colorhunt.co/palette/164029
		const colorChoices = [
			'#fa697c',
			'#e13a9d',
			'#9b45e4',
			'#fcc169',
		];
		const randomIndex = Math.floor(Math.random() * colorChoices.length);
		return colorChoices[randomIndex];
	}

	public tick(drag: number, density: number, gravity: number): void {
		const fx = getAerodynamicForce(drag, density, this.area, this.velocity.x);
		const fy = getAerodynamicForce(drag, density, this.area, this.velocity.y);

		const ax = getAccelerationX(fx, this.mass);
		const ay = getAccelerationY(fy, this.mass, gravity * GRAVITY_ACCELERATION);

		this.velocity.x += ax * FPS;
		this.velocity.y += ay * FPS;

		this.position.x += this.velocity.x * FPS * 100;
		this.position.y += this.velocity.y * FPS * 100;
	}

	public collisionWalls(width: number, height: number): void {
		if (this.position.x > width - this.radius) {
			this.velocity.x *= COLLISION_COEFFICIENT;
			this.position.x = width - this.radius;
		}
		if (this.position.y > height - this.radius) {
			this.velocity.y *= COLLISION_COEFFICIENT;
			this.position.y = height - this.radius;
		}
		if (this.position.x < this.radius) {
			this.velocity.x *= COLLISION_COEFFICIENT;
			this.position.x = this.radius;
		}
		if (this.position.y < this.radius) {
			this.velocity.y *= COLLISION_COEFFICIENT;
			this.position.y = this.radius;
		}
	}

	public collisionOtherBalls(otherBalls: Array<Ball>): void {
		for (const otherBall of otherBalls) {
			if (this.id !== otherBall.id && !this.samePositionAs(otherBall) && this.collidesWith(otherBall)) {
				// Pythagoras
				const distX = this.position.x - otherBall.position.x;
				const distY = this.position.y - otherBall.position.y;
				const d = Math.sqrt((distX) * (distX) + (distY) * (distY));

				// Checking circle collision
				if (d < this.radius + otherBall.radius) {
					const nx = (otherBall.position.x - this.position.x) / d;
					const ny = (otherBall.position.y - this.position.y) / d;
					const p = 2 * (this.velocity.x * nx + this.velocity.y * ny - otherBall.velocity.x * nx - otherBall.velocity.y * ny) / (this.mass + otherBall.mass);

					// The point of collision
					const colPointX = ((this.position.x * otherBall.radius) + (otherBall.position.x * this.radius)) / (this.radius + otherBall.radius);
					const colPointY = ((this.position.y * otherBall.radius) + (otherBall.position.y * this.radius)) / (this.radius + otherBall.radius);

					// Preventing overlap
					this.position.x = colPointX + this.radius * (this.position.x - otherBall.position.x) / d;
					this.position.y = colPointY + this.radius * (this.position.y - otherBall.position.y) / d;
					otherBall.position.x = colPointX + otherBall.radius * (otherBall.position.x - this.position.x) / d;
					otherBall.position.y = colPointY + otherBall.radius * (otherBall.position.y - this.position.y) / d;

					// Updating velocity
					this.velocity.x -= p * this.mass * nx;
					this.velocity.y -= p * this.mass * ny;
					otherBall.velocity.x += p * otherBall.mass * nx;
					otherBall.velocity.y += p * otherBall.mass * ny;
				}
			}
		}
	}

	public collidesWith(otherBall: Ball): boolean {
		// AABBs
		return this.position.x + this.radius + otherBall.radius > otherBall.position.x
			&& this.position.x < otherBall.position.x + this.radius + otherBall.radius
			&& this.position.y + this.radius + otherBall.radius > otherBall.position.y
			&& this.position.y < otherBall.position.y + this.radius + otherBall.radius;
	}

	public samePositionAs(otherBall: Ball): boolean {
		return this.position.x === otherBall.position.x &&
			this.position.y === otherBall.position.y;
	}
}
