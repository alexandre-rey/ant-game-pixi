import { Application, Assets, Sprite } from "pixi.js";
import { Direction } from "../types";
import { Food } from "./food";
import { Nest } from "./nest";
import { Pheromon } from "./pheromon";

export class Ant {

    private sprite: Sprite | null = null;
    private direction: Direction = {
        x: Math.random() - 0.5,
        y: Math.random() - 0.5
    }
    private speed: number = 2;
    private boundX: number = 0;
    private boundY: number = 0;
    private hasFood: boolean = false;
    private pheromonTimer: number;
    private perceptionRadius = 200;
    private foodOrigin: {
        x: number,
        y: number
    } = { x: 0, y: 0 }

    constructor(private nest: Nest) {
        this.pheromonTimer = 200;
    }

    public async setup(startX: number, startY: number, app: Application) {

        const texture = await Assets.load('/ant.png');
        this.sprite = new Sprite(texture);
        this.sprite = new Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.x = startX;
        this.sprite.y = startY;
        this.sprite.scale.set(0.05);

        this.normalizeDirection();

        app.stage.addChild(this.sprite);

        this.boundX = app.screen.width;
        this.boundY = app.screen.height;
    }

    // direction est un vecteur donc on le ramene tjr a une longueur de 1 pour que direction * vitesse change seulement la direction et pas la vitesse
    private normalizeDirection() {
        const length = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y);
        this.direction.x /= length;
        this.direction.y /= length;
    }

    public updateDirection(foods: Food[]) {

        if (this.sprite) {

            if (this.hasFood) {

                const dx = this.nest.x - this.sprite.x;
                const dy = this.nest.y - this.sprite.y;

                const distToNest = Math.sqrt(dx * dx + dy * dy);

                if (distToNest < 20) {
                    this.hasFood = false;
                    this.foodOrigin = {
                        x: 0,
                        y: 0
                    };
                    this.nest.addFood();
                } else {
                    this.direction.x = dx / distToNest;
                    this.direction.y = dy / distToNest;
                }

                return;
            }

            let closestFood: Food | null = null;
            let minDist: number = Infinity;

            foods.forEach(food => {

                if (this.sprite) {

                    const dx = food.x - this.sprite.x;
                    const dy = food.y - this.sprite.y;

                    const distToFood = Math.sqrt(dx * dx + dy * dy);

                    if (distToFood < minDist) {
                        minDist = distToFood;
                        closestFood = food;
                    }
                }
            });

            if (closestFood) {

                closestFood = closestFood as Food;
                const dx = closestFood.x - this.sprite.x;
                const dy = closestFood.y - this.sprite.y;
                const distToFood = Math.sqrt(dx * dx + dy * dy);

                if (distToFood < 100) {
                    this.direction.x = dx / distToFood;
                    this.direction.y = dy / distToFood;
                } else {
                    this.direction.x += (Math.random() - 0.5) * 0.2;
                    this.direction.y += (Math.random() - 0.5) * 0.2;

                    this.normalizeDirection();
                }


            } else {

                this.direction.x += (Math.random() - 0.5) * 0.2;
                this.direction.y += (Math.random() - 0.5) * 0.2;

                this.normalizeDirection();
            }
        }
    }

    public eatFood(foods: Food[], app: Application) {

        if (this.hasFood) return;

        foods.forEach((food, index) => {

            if (this.sprite) {
                const dx = food.x - this.sprite.x;
                const dy = food.y - this.sprite.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 5 + 5) {
                    app.stage.removeChild(food.graphics);
                    foods.splice(index, 1);
                    this.hasFood = true;
                    this.foodOrigin = {
                        x: food.x,
                        y: food.y
                    };
                }
            }
        });
    }

    public move(app: Application, pheromons: Pheromon[]): Pheromon | null {

        if (this.sprite) {

            this.followPheromons(pheromons);

            this.sprite.x += this.direction.x * this.speed;
            this.sprite.y += this.direction.y * this.speed;


            if (this.sprite.x < 0 || this.sprite.x > this.boundX - 100) {
                this.direction.x = -this.direction.x;
            }

            if (this.sprite.y < 0 || this.sprite.y > this.boundY - 100) {
                this.direction.y = -this.direction.y;
            }

            if (this.pheromonTimer++ % 5 === 0) {

                let type = this.hasFood ? 'toNest' : 'toFood';

                return new Pheromon(
                    this.sprite.x,
                    this.sprite.y,
                    type,
                    this.foodOrigin,
                    app
                );
            }
        }

        return null;
    }

    private followPheromons(pheromones: Pheromon[]) {

        if (this.hasFood) return;

        let closestPheromone: Pheromon | null = null;

        let reachablePheromenons = pheromones.filter(pheromone => {
            if (pheromone.type === 'toNest') return true;
            else return false;
        });

        if (reachablePheromenons.length > 0) {

            reachablePheromenons = reachablePheromenons.filter(pheromone => {

                if (this.sprite) {
                    const dx = pheromone.graphics.getGlobalPosition().x - this.sprite.x;
                    const dy = pheromone.graphics.getGlobalPosition().y - this.sprite.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < this.perceptionRadius) return true;
                }

                return false;
            });
        }

        if (reachablePheromenons.length > 0) {
            closestPheromone = reachablePheromenons[0];

            if(this.sprite){
                const dx = closestPheromone.graphics.getGlobalPosition().x - this.sprite.x;
                const dy = closestPheromone.graphics.getGlobalPosition().y - this.sprite.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
    
                if (closestPheromone && dist > 50) {
                    this.updateDirectionTowards(closestPheromone.origin.x, closestPheromone.origin.y);
                }
            }
        }



    }

    private updateDirectionTowards(x: number, y: number) {

        if (this.sprite) {
            const dx = x - this.sprite.x;
            const dy = y - this.sprite.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                this.direction.x = dx / dist;
                this.direction.y = dy / dist;
            }
        }

    }

}