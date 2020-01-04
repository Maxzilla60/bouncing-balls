import Point from './Point';

export default class Mouse extends Point {
	public x = 0;
	public y = 0;
	public isDown = false;

	constructor(canvas: HTMLCanvasElement) {
		super();
		canvas.addEventListener('mousemove', (event: MouseEvent) => {
			this.x = event.pageX - canvas.offsetLeft;
			this.y = event.pageY - canvas.offsetTop;
		});
		canvas.addEventListener('mousedown', (event: MouseEvent) => {
			if (event.button === 0) {
				this.isDown = true;
			}
		});
		canvas.addEventListener('mouseup', (event: MouseEvent) => {
			if (event.button === 0) {
				this.isDown = false;
			}
		});
		canvas.addEventListener('touchmove', (event: TouchEvent) => {
			if (event.target === canvas && event.touches[0]) {
				event.preventDefault();
				const touch = event.touches[0];
				this.x = touch.pageX - canvas.offsetLeft;
				this.y = touch.pageY - canvas.offsetTop;
			}
		}, false);
		canvas.addEventListener('touchstart', (event: TouchEvent) => {
			if (event.target === canvas) {
				event.preventDefault();
				this.isDown = true;
				if (event.touches[0]) {
					const touch = event.touches[0];
					this.x = touch.pageX - canvas.offsetLeft;
					this.y = touch.pageY - canvas.offsetTop;
				}
			}
		}, false);
		canvas.addEventListener('touchend', (event: TouchEvent) => {
			if (event.target === canvas) {
				event.preventDefault();
				this.isDown = false;
			}
		}, false);
	}

	public toString(): string {
		return `${this.isDown} {${this.x}, ${this.y}}`;
	}
}
