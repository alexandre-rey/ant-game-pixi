import { Application, Text } from 'pixi.js'
import { Ant } from './entities/ant';
import { Food } from './entities/food';
import { Nest } from './entities/nest';
import { Pheromon } from './entities/pheromon';

// Asynchronous IIFE
(async () => {
	// Create a PixiJS application.
	const app = new Application();

	// Intialize the application.
	await app.init({
		view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
		resolution: window.devicePixelRatio || 1,
		autoDensity: true,
		backgroundColor: 0x6495ed,
		resizeTo: window
	});
	document.body.appendChild(app.canvas);

	const numberOfPacks = 20;
	const foodPerPack = 10;
	const packRadius = 50;

	const ants: Ant[] = [];
	const foods: Food[] = [];
	const pheromons: Pheromon[] = [];
	const nest = new Nest(
		app.screen.width / 2,
		app.screen.height / 2
	);
	nest.draw(app);

	const FPSDisplay = new Text(
		0,
		{
			fontFamily: 'Arial',
			fontSize: 24,
			fill: 0xffffff,
			align: 'center'
		}
	);

	FPSDisplay.x = 10;
	FPSDisplay.y = 10;
	app.stage.addChild(FPSDisplay);

	for (let i = 0; i < 50; i++) {

		let ant = new Ant(nest);

		await ant.setup(
			nest.x,
			nest.y,
			app
		);

		ants.push(ant);
	}



	for (let i = 0; i < numberOfPacks; i++) {
		// Choisir un point central aléatoire pour le paquet
		const packCenterX = Math.random() * app.screen.width;
		const packCenterY = Math.random() * app.screen.height;

		for (let j = 0; j < foodPerPack; j++) {
			// Générer des positions aléatoires autour du centre du paquet
			const angle = Math.random() * Math.PI * 2; // Angle aléatoire pour la dispersion
			const distance = Math.random() * packRadius; // Distance aléatoire du centre, dans le rayon défini
			const foodX = packCenterX + Math.cos(angle) * distance;
			const foodY = packCenterY + Math.sin(angle) * distance;

			// Créer et ajouter le morceau de nourriture à cette position
			const foodItem = new Food(foodX, foodY);
			foodItem.draw(app);
			foods.push(foodItem);
		}
	}

	let counter = 0;

	app.ticker.add((timer) => {

		counter++;
		if(counter === 20){
			FPSDisplay.text = Math.round(timer.FPS);
			counter = 0;
		}

		
		

		ants.forEach(ant => {
			ant.updateDirection(foods);
			let newPheromon = ant.move(app, pheromons);

			if (newPheromon) {
				pheromons.push(newPheromon);
			}

			ant.eatFood(foods, app);
		});

		pheromons.forEach((pheromon, index) => {
			const alive = pheromon.update(app);
			if (!alive) {
				pheromons.splice(index, 1);
			}
		})
	});

})();