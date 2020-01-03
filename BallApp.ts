import Ball from './Ball';
import { COLLISION_COEFFICIENT, GRAVITY_ACCELERATION, TIMER_SPEED } from './config';
import Point from './Point';

class Mouse extends Point {
	public x = 0;
	public y = 0;
	public isDown = false;
}
export default class BallApp {
	private readonly canvas: HTMLCanvasElement;
	private readonly ctx: CanvasRenderingContext2D;
	private readonly gravityElement: HTMLInputElement;
	private readonly densityElement: HTMLInputElement;
	private readonly dragElement: HTMLInputElement;
	private timerID: number;
	private mouse = new Mouse();
	private balls: Array<Ball> = [];
	public constructor() {
		this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d');
		this.gravityElement = document.getElementById('gravity') as HTMLInputElement;
		this.densityElement = document.getElementById('density') as HTMLInputElement;
		this.dragElement = document.getElementById('drag') as HTMLInputElement;
	}
	public start(): void {
		this.canvas.addEventListener('mousedown', this.mouseDown.bind(this));
		this.canvas.addEventListener('mouseup', this.mouseUp.bind(this));
		this.canvas.addEventListener('mousemove', this.setMousePositionForEvent.bind(this));
		this.timerID = setInterval(this.loop.bind(this), TIMER_SPEED);
	}
	private loop(): void {
		this.ctx.clearRect(0, 0, this.width, this.height);
		for (let i = 0; i < this.balls.length; i++) {
			const ball = this.balls[i];
			if (!this.mouse.isDown || i < this.balls.length - 1) {
				ball.tick(this.drag, this.density, this.gravity);
			}
			this.collisionOtherBalls(ball);
			this.collisionWall(ball);
		}
		this.render();
	}
	private collisionOtherBalls(ball: Ball): void {
		for (let i = 0; i < this.balls.length; i++) {
			const otherBall = this.balls[i];
			if (ball.position.x !== otherBall.position.x && ball.position.y !== otherBall.position.y) {
				// quick check for potential collisions using AABBs
				if (ball.position.x + ball.radius + otherBall.radius > otherBall.position.x
					&& ball.position.x < otherBall.position.x + ball.radius + otherBall.radius
					&& ball.position.y + ball.radius + otherBall.radius > otherBall.position.y
					&& ball.position.y < otherBall.position.y + ball.radius + otherBall.radius) {
					// pythagoras
					const distX = ball.position.x - otherBall.position.x;
					const distY = ball.position.y - otherBall.position.y;
					const d = Math.sqrt((distX) * (distX) + (distY) * (distY));
					// checking circle vs circle collision
					if (d < ball.radius + otherBall.radius) {
						const nx = (otherBall.position.x - ball.position.x) / d;
						const ny = (otherBall.position.y - ball.position.y) / d;
						const p = 2 * (ball.velocity.x * nx + ball.velocity.y * ny - otherBall.velocity.x * nx - otherBall.velocity.y * ny) / (ball.mass + otherBall.mass);
						// calculating the point of collision
						const colPointX = ((ball.position.x * otherBall.radius) + (otherBall.position.x * ball.radius)) / (ball.radius + otherBall.radius);
						const colPointY = ((ball.position.y * otherBall.radius) + (otherBall.position.y * ball.radius)) / (ball.radius + otherBall.radius);
						// stopping overlap
						ball.position.x = colPointX + ball.radius * (ball.position.x - otherBall.position.x) / d;
						ball.position.y = colPointY + ball.radius * (ball.position.y - otherBall.position.y) / d;
						otherBall.position.x = colPointX + otherBall.radius * (otherBall.position.x - ball.position.x) / d;
						otherBall.position.y = colPointY + otherBall.radius * (otherBall.position.y - ball.position.y) / d;
						// updating velocity to reflect collision
						ball.velocity.x -= p * ball.mass * nx;
						ball.velocity.y -= p * ball.mass * ny;
						otherBall.velocity.x += p * otherBall.mass * nx;
						otherBall.velocity.y += p * otherBall.mass * ny;
					}
				}
			}
		}
	}
	private collisionWall(ball: Ball): void {
		if (ball.position.x > this.width - ball.radius) {
			ball.velocity.x *= COLLISION_COEFFICIENT;
			ball.position.x = this.width - ball.radius;
		}
		if (ball.position.y > this.height - ball.radius) {
			ball.velocity.y *= COLLISION_COEFFICIENT;
			ball.position.y = this.height - ball.radius;
		}
		if (ball.position.x < ball.radius) {
			ball.velocity.x *= COLLISION_COEFFICIENT;
			ball.position.x = ball.radius;
		}
		if (ball.position.y < ball.radius) {
			ball.velocity.y *= COLLISION_COEFFICIENT;
			ball.position.y = ball.radius;
		}
	}
	private mouseDown(event: MouseEvent): void {
		if (event.button === 0) {
			this.setMousePositionForEvent(event);
			this.mouse.isDown = true;
			this.balls.push(new Ball(this.mouse));
		}
	}
	private setMousePositionForEvent(event: MouseEvent): void {
		this.mouse.x = event.pageX - this.canvas.offsetLeft;
		this.mouse.y = event.pageY - this.canvas.offsetTop;
	}
	private mouseUp(event: MouseEvent): void {
		if (event.button === 0) {
			this.mouse.isDown = false;
			this.lastBall.velocity.x = (this.lastBall.position.x - this.mouse.x) / 10;
			this.lastBall.velocity.y = (this.lastBall.position.y - this.mouse.y) / 10;
		}
	}
	private render(): void {
		this.renderBalls();
		if (this.mouse.isDown) {
			this.renderSlingshot();
		}
		this.renderInfo();
	}
	private renderBalls(): void {
		this.balls.forEach(this.renderBall.bind(this));
	}
	private renderBall(ball: Ball): void {
		this.ctx.beginPath();
		this.ctx.fillStyle = ball.color;
		this.ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, 2 * Math.PI, true);
		this.ctx.fill();
		this.ctx.closePath();
	}
	private renderSlingshot(): void {
		this.ctx.beginPath();
		this.ctx.strokeStyle = 'red';
		this.ctx.moveTo(this.lastBall.position.x, this.lastBall.position.y);
		this.ctx.lineTo(this.mouse.x, this.mouse.y);
		this.ctx.stroke();
		this.ctx.closePath();
	}
	private renderInfo(): void {
		this.ctx.fillStyle = 'black';
		this.ctx.font = '11pt monospace';
		this.ctx.fillText(`Number of Balls: ${this.balls.length}`, 0, 16);
		this.ctx.fillText(`Drag Coefficient: ${this.drag}`, 0, 32);
		this.ctx.fillText(`Fluid Density: ${this.density} kg/m^3`, 0, 48);
		this.ctx.fillText(`Acceleration due to gravity: ${this.gravity * GRAVITY_ACCELERATION} g`, 0, 64);
		this.ctx.fillText(`Mouse: ${this.mouse.isDown}`, 0, 80);
	}
	private get lastBall(): Ball {
		return this.balls[this.balls.length - 1];
	}
	private get gravity(): number {
		return +this.gravityElement.value;
	}
	private get density(): number {
		return +this.densityElement.value;
	}
	private get drag(): number {
		return +this.dragElement.value;
	}
	private get width(): number {
		return this.canvas.width;
	}
	private get height(): number {
		return this.canvas.height;
	}
}
