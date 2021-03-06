import Ball from './Ball';
import colorHunt from './ColorHuntService';
import { GRAVITY_ACCELERATION, TIMER_SPEED } from './config';
import Mouse from './Mouse';

export default class BallApp {
	private readonly canvas: HTMLCanvasElement;
	private readonly ctx: CanvasRenderingContext2D;

	private readonly gravityElement: HTMLInputElement;
	private readonly densityElement: HTMLInputElement;
	private readonly dragElement: HTMLInputElement;

	private balls: Array<Ball> = [];
	private mouse: Mouse;

	public constructor() {
		this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d');
		this.gravityElement = document.getElementById('gravity') as HTMLInputElement;
		this.densityElement = document.getElementById('density') as HTMLInputElement;
		this.dragElement = document.getElementById('drag') as HTMLInputElement;
	}

	public async start(): Promise<void> {
		this.mouse = new Mouse(this.canvas);
		this.canvas.addEventListener('mousedown', this.mouseDown.bind(this));
		this.canvas.addEventListener('mouseup', this.mouseUp.bind(this));
		this.canvas.addEventListener('touchstart', this.mouseDown.bind(this));
		this.canvas.addEventListener('touchend', this.mouseUp.bind(this));
		(document.getElementById('reset') as HTMLButtonElement).addEventListener('click', this.clearBalls.bind(this));
		await colorHunt.init();
		setInterval(this.loop.bind(this), TIMER_SPEED);
	}

	private loop(): void {
		this.ctx.clearRect(0, 0, this.width, this.height);
		for (let i = 0; i < this.balls.length; i++) {
			const ball = this.balls[i];
			if (!this.isPullingSlingshot() || i < this.balls.length - 1) {
				ball.tick(this.drag, this.density, this.gravity);
			}
			ball.collisionOtherBalls(this.balls.filter(b => b.id !== ball.id));
			ball.collisionWalls(this.width, this.height);
		}
		this.render();
	}

	private mouseDown(event: MouseEvent | TouchEvent): void {
		if ((event instanceof MouseEvent && event.button === 0) ||
			(event instanceof TouchEvent && event.target === this.canvas)) {
			event.preventDefault();
			this.balls.push(new Ball(this.mouse, this.balls.length));
		}
	}

	private mouseUp(event: MouseEvent | TouchEvent): void {
		if (event instanceof MouseEvent && event.button === 0) {
			this.releaseSlingshot();
		} else if (event instanceof TouchEvent && event.target === this.canvas) {
			event.preventDefault();
			this.releaseSlingshot();
		}
	}

	private clearBalls(): void {
		this.balls = [];
	}

	private isPullingSlingshot(): boolean {
		return this.mouse.isDown;
	}

	private releaseSlingshot(): void {
		this.lastBall.velocity.x = (this.lastBall.position.x - this.mouse.x) / 10;
		this.lastBall.velocity.y = (this.lastBall.position.y - this.mouse.y) / 10;
	}

	private render(): void {
		this.renderBalls();
		if (this.isPullingSlingshot()) {
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
		this.ctx.lineWidth = 5;
		this.ctx.strokeStyle = this.lastBall.color;
		this.ctx.moveTo(this.lastBall.position.x, this.lastBall.position.y);
		this.ctx.lineTo(this.mouse.x, this.mouse.y);
		this.ctx.stroke();
		this.ctx.closePath();
	}

	private renderInfo(): void {
		this.ctx.fillStyle = 'black';
		this.ctx.font = '11pt monospace';
		this.ctx.fillText(`Number of Balls: ${this.balls.length}`, 5, 16);
		this.ctx.fillText(`Fluid Density: ${this.density} kg/m^3`, 5, 32);
		this.ctx.fillText(`Acceleration: ${this.gravity * GRAVITY_ACCELERATION} g`, 5, 48);
		this.ctx.fillText(`Drag Coefficient: ${this.drag}`, 5, 64);
		// this.ctx.fillText(`Mouse: ${this.mouse}`, 5, 80);
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
