import { Application, Graphics } from "pixi.js";


export class Pheromon {

    public graphics: Graphics;
    private lifespan: number;
    public type: string;
    public origin: {
        x: number,
        y: number
    }

    constructor(public x: number, public y: number, type: string = 'toFood', origin: { x: number, y: number }, app: Application) {

        this.lifespan = 250;
        this.type = type;

        this.graphics = new Graphics();
        this.graphics.position.x = x;
        this.graphics.position.y = y;
        this.graphics.circle(0, 0, 2);
        this.graphics.fill(this.type === 'toFood' ? 0x00FF00 : 0xFF0000);

        app.stage.addChild(this.graphics);

        this.origin = origin;
    }

    public update(app: Application): boolean {
        this.lifespan--;
        this.graphics.alpha = this.lifespan / 100;

        if (this.lifespan <= 0) {
            app.stage.removeChild(this.graphics);
            return false;
        }

        return true;

    }

}