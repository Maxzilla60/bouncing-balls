import Ball from './Ball';
import { GRAVITY_ACCELERATION, TIMER_SPEED } from './config';
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
			ball.collisionOtherBalls(this.balls);
			ball.collisionWall(this.width, this.height);
		}
		this.render();
	}

	private mouseDown(event: MouseEvent): void {
		if (event.button === 0) {
			this.setMousePositionForEvent(event);
			this.mouse.isDown = true;
			this.balls.push(new Ball(this.mouse, this.balls.length));
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
