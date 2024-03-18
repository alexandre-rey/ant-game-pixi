import { Application, Graphics } from "pixi.js";


export class Pheromon {

    private graphics: Graphics;
    private lifespan: number;


    constructor(public x: number, public y: number, app: Application) {

        this.lifespan = 250;

        this.graphics = new Graphics();
        this.graphics.circle(x, y, 2);
        this.graphics.fill(0x00FF00);
        app.stage.addChild(this.graphics);

    }

    public update(app:Application):boolean{
        this.lifespan--;
        this.graphics.alpha = this.lifespan/100;

        if(this.lifespan <= 0){
            app.stage.removeChild(this.graphics);
            return false;
        }

        return true;

    }

}