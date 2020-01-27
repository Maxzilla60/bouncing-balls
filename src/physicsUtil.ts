export function getAerodynamicForce(drag: number, density: number, area: number, velocity: number): number {
	const rho = (velocity / Math.abs(velocity));
	const result = -0.5 * drag * density * area * velocity * velocity * rho;
	return isNaN(result) ? 0 : result;
}

export function getAccelerationX(fx: number, ballMass: number): number {
	return fx / ballMass;
}

export function getAccelerationY(fy: number, mass: number, gravity: number): number {
	return gravity + (fy / mass);
}

export function randomChoice<T>(array: Array<T>): T {
	const randomIndex = Math.floor(Math.random() * array.length);
	return array[randomIndex];
}
