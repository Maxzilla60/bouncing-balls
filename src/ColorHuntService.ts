import { randomChoice } from './physicsUtil';

class ColorHuntService {
	private palette: Array<string>;
	private readonly api = `https://simplescraper.io/api/6RF1Ti1aVauCXqAHeyZ3?apikey=${process.env.SIMPLESCRAPER_API_KEY}`;
	private readonly fetchLimit = 20;

	public async init(): Promise<void> {
		const randomPalette = await this.fetchRandomPalette();
		this.palette = [
			randomPalette.color1,
			randomPalette.color2,
			randomPalette.color3,
			randomPalette.color4,
		];
		(document.getElementById('colorhunt-link') as HTMLAnchorElement).href = randomPalette.u_link;
	}

	public getRandomColor(): string {
		if (this.palette) {
			return randomChoice(this.palette);
		}
		return 'black';
	}

	private async fetchRandomPalette(): Promise<ColorPalette> {
		const url = `${this.api}&offset=0&limit=${this.fetchLimit}`;
		const fetchResponse = await fetch(url);
		if (fetchResponse.ok) {
			const hunts = (await fetchResponse.json()).data as Array<ColorPalette>;
			return randomChoice(hunts);
		}
		return this.defaultPalette;
	}

	private get defaultPalette(): ColorPalette {
		return {
			u_link: 'https://colorhunt.co/palette/164029',
			color1: '#fa697c',
			color2: '#e13a9d',
			color3: '#9b45e4',
			color4: '#fcc169',
			index: 0, likes: 0,
		};
	}
}

interface ColorPalette {
	color1: string;
	color2: string;
	color3: string;
	color4: string;
	index: number;
	likes: number;
	u_link: string;
}

const colorHunt = new ColorHuntService();
export default colorHunt;
