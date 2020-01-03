import { FPS, GRAVITY_ACCELERATION } from './config';
import { getAccelerationX, getAccelerationY, getAerodynamicForce } from './physicsUtil';
import Point from './Point';

export default class Ball {
	public readonly radius = 10;
	public readonly color = 'blue';
	public readonly mass = 10;
	public velocity: Point = { x: 0, y: 0 };

	public position: Point;
	public get area(): number {
		return (Math.PI * this.radius * this.radius) / 1000;
	}

	constructor(position: Point) {
		this.position = { ...position };
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
}
