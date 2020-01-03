function Ball(x: number, y: number, radius: number, e: number, mass: number, colour: string): void {
	this.position = { x, y }; // m
	this.velocity = { x: 0, y: 0 }; // m/s
	this.e = -e; // has no units
	this.mass = mass; // kg
	this.radius = radius; // m
	this.colour = colour;
	this.area = (Math.PI * radius * radius) / 10000; // m^2
}
let canvas = null;
let ctx = null;
let fps = 1 / 60; // 60 FPS
let dt = fps * 1000; // ms
let timer: number | false = false;
let Cd = 0.47;
let rho = 1.22; // kg/m^3
let mouse = { x: 0, y: 0, isDown: false };
let ag = 9.81; // m/s^2 acceleration due to gravity on earth = 9.81 m/s^2.
let width = 0;
let height = 0;
let balls = [];

const setup = function(): void {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	width = canvas.width;
	height = canvas.height;

	canvas.onmousedown = mouseDown;
	canvas.onmouseup = mouseUp;
	canvas.onmousemove = getMousePosition;
	timer = setInterval(loop, dt);
};

const mouseDown = function(e: { pageX: number; pageY: number; which: number; }): void {
	if (e.which === 1) {
		getMousePosition(e);
		mouse.isDown = true;
		const max = 255;
		const min = 20;
		const r = 75 + Math.floor(Math.random() * (max - min) - min);
		const g = 75 + Math.floor(Math.random() * (max - min) - min);
		const b = 75 + Math.floor(Math.random() * (max - min) - min);
		balls.push(new Ball(mouse.x, mouse.y, 10, 0.7, 10, `rgb(${r},${g},${b})`));
	}
};

let mouseUp = function(e: { which: number; }): void {
	if (e.which === 1) {
		mouse.isDown = false;
		balls[balls.length - 1].velocity.x = (balls[balls.length - 1].position.x - mouse.x) / 10;
		balls[balls.length - 1].velocity.y = (balls[balls.length - 1].position.y - mouse.y) / 10;
	}
};

window.addEventListener('load', setup);

function getMousePosition(e: { pageX: number; pageY: number; }): void {
	mouse.x = e.pageX - canvas.offsetLeft;
	mouse.y = e.pageY - canvas.offsetTop;
}

function loop(): void {
	// create constants
	const gravity = document.getElementById('gravity') as HTMLInputElement;
	const density = document.getElementById('density') as HTMLInputElement;
	const drag = document.getElementById('drag') as HTMLInputElement;

	// Clear window at the beginning of every frame
	ctx.clearRect(0, 0, width, height);
	for (let i = 0; i < balls.length; i++) {
		if (!mouse.isDown || i !== balls.length - 1) {
			// physics - calculating the aerodynamic forces to drag
			// -0.5 * Cd * A * v^2 * rho
			let fx = -0.5 * drag.value * density.value * balls[i].area * balls[i].velocity.x * balls[i].velocity.x * (balls[i].velocity.x / Math.abs(balls[i].velocity.x));
			let fy = -0.5 * drag.value * density.value * balls[i].area * balls[i].velocity.y * balls[i].velocity.y * (balls[i].velocity.y / Math.abs(balls[i].velocity.y));

			fx = (isNaN(fx) ? 0 : fx);
			fy = (isNaN(fy) ? 0 : fy);
			// Calculating the acceleration of the ball
			// F = ma or a = F/m
			const ax = fx / balls[i].mass;
			const ay = (ag * gravity.value) + (fy / balls[i].mass);

			// Calculating the ball velocity
			balls[i].velocity.x += ax * fps;
			balls[i].velocity.y += ay * fps;

			// Calculating the position of the ball
			balls[i].position.x += balls[i].velocity.x * fps * 100;
			balls[i].position.y += balls[i].velocity.y * fps * 100;
		}

		// Rendering the ball
		ctx.beginPath();
		ctx.fillStyle = balls[i].colour;
		ctx.arc(balls[i].position.x, balls[i].position.y, balls[i].radius, 0, 2 * Math.PI, true);
		ctx.fill();
		ctx.closePath();

		if (mouse.isDown) {
			ctx.beginPath();
			ctx.strokeStyle = 'rgb(0,255,0)';
			ctx.moveTo(balls[balls.length - 1].position.x, balls[balls.length - 1].position.y);
			ctx.lineTo(mouse.x, mouse.y);
			ctx.stroke();
			ctx.closePath();
		}
		// Handling the ball collisions
		collisionBall(balls[i]);
		collisionWall(balls[i]);
	}

	// Rendering Text
	ctx.fillStyle = 'white';
	ctx.font = '11pt Ariel';
	ctx.fillText(`Number of Balls: ${balls.length}`, 0, 16);
	ctx.fillText(`Drag Coefficient: ${drag.value}`, 0, 32);
	ctx.fillText(`Fluid Density: ${density.value} kg/m^3`, 0, 48);
	ctx.fillText(`Acceleration due to gravity: ${gravity.value} g`, 0, 64);
	ctx.fillText(`Room Width: ${width / 1000} m`, 0, 80);
	ctx.fillText(`Room Height: ${height / 1000} m`, 0, 96);
}

function collisionWall(ball: { position: { x: number; y: number; }; radius: number; velocity: { x: number; y: number; }; e: number; }): void {
	if (ball.position.x > width - ball.radius) {
		ball.velocity.x *= ball.e;
		ball.position.x = width - ball.radius;
	}
	if (ball.position.y > height - ball.radius) {
		ball.velocity.y *= ball.e;
		ball.position.y = height - ball.radius;
	}
	if (ball.position.x < ball.radius) {
		ball.velocity.x *= ball.e;
		ball.position.x = ball.radius;
	}
	if (ball.position.y < ball.radius) {
		ball.velocity.y *= ball.e;
		ball.position.y = ball.radius;
	}
}
function collisionBall(b1: { position: { x: number; y: number; }; radius: number; velocity: { x: number; y: number; }; mass: number; }): void {
	for (let i = 0; i < balls.length; i++) {
		const b2 = balls[i];
		if (b1.position.x !== b2.position.x && b1.position.y !== b2.position.y) {
			// quick check for potential collisions using AABBs
			if (b1.position.x + b1.radius + b2.radius > b2.position.x
				&& b1.position.x < b2.position.x + b1.radius + b2.radius
				&& b1.position.y + b1.radius + b2.radius > b2.position.y
				&& b1.position.y < b2.position.y + b1.radius + b2.radius) {

				// pythagoras
				const distX = b1.position.x - b2.position.x;
				const distY = b1.position.y - b2.position.y;
				const d = Math.sqrt((distX) * (distX) + (distY) * (distY));

				// checking circle vs circle collision
				if (d < b1.radius + b2.radius) {
					const nx = (b2.position.x - b1.position.x) / d;
					const ny = (b2.position.y - b1.position.y) / d;
					const p = 2 * (b1.velocity.x * nx + b1.velocity.y * ny - b2.velocity.x * nx - b2.velocity.y * ny) / (b1.mass + b2.mass);

					// calculating the point of collision
					const colPointX = ((b1.position.x * b2.radius) + (b2.position.x * b1.radius)) / (b1.radius + b2.radius);
					const colPointY = ((b1.position.y * b2.radius) + (b2.position.y * b1.radius)) / (b1.radius + b2.radius);

					// stopping overlap
					b1.position.x = colPointX + b1.radius * (b1.position.x - b2.position.x) / d;
					b1.position.y = colPointY + b1.radius * (b1.position.y - b2.position.y) / d;
					b2.position.x = colPointX + b2.radius * (b2.position.x - b1.position.x) / d;
					b2.position.y = colPointY + b2.radius * (b2.position.y - b1.position.y) / d;

					// updating velocity to reflect collision
					b1.velocity.x -= p * b1.mass * nx;
					b1.velocity.y -= p * b1.mass * ny;
					b2.velocity.x += p * b2.mass * nx;
					b2.velocity.y += p * b2.mass * ny;
				}
			}
		}
	}
}
