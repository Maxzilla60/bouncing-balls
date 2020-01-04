import Point from './Point';

export default class Mouse extends Point {
	public x = 0;
	public y = 0;
	public isDown = false;
	private readonly canvas: HTMLCanvasElement;

	constructor(canvas: HTMLCanvasElement) {
		super();
		this.canvas = canvas;
		canvas.addEventListener('mousemove', this.handleMoveEvent.bind(this));
		canvas.addEventListener('mousedown', this.handleStartEvent.bind(this));
		canvas.addEventListener('mouseup', this.handleEndEvent.bind(this));
		// http://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html
		canvas.addEventListener('touchmove', this.handleMoveEvent.bind(this), false);
		canvas.addEventListener('touchstart', this.handleStartEvent.bind(this), false);
		canvas.addEventListener('touchend', this.handleEndEvent.bind(this), false);
	}

	public toString(): string {
		return `${this.isDown} {${this.x}, ${this.y}}`;
	}

	private updatePosition(event: MouseEvent | Touch): void {
		this.x = event.pageX - this.canvas.offsetLeft;
		this.y = event.pageY - this.canvas.offsetTop;
	}

	private handleMoveEvent(event: MouseEvent | TouchEvent): void {
		if (event instanceof MouseEvent) {
			this.updatePosition(event);
		} else if (event instanceof TouchEvent && event.target === this.canvas && event.touches[0]) {
			event.preventDefault();
			this.updatePosition(event.touches[0]);
		}
	}

	private handleStartEvent(event: MouseEvent | TouchEvent): void {
		if (event instanceof MouseEvent && event.button === 0) {
			this.isDown = true;
		} else if (event instanceof TouchEvent && event.target === this.canvas && event.touches[0]) {
			event.preventDefault();
			this.isDown = true;
			this.updatePosition(event.touches[0]);
		}
	}

	private handleEndEvent(event: MouseEvent | TouchEvent): void {
		if (event instanceof MouseEvent && event.button === 0) {
			this.isDown = false;
		} else if (event instanceof TouchEvent && event.target === this.canvas) {
			event.preventDefault();
			this.isDown = false;
		}
	}
}
