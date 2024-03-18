import { Application, Graphics } from "pixi.js";

export class Food {

    public graphics: Graphics;

    constructor(public x:number, public y: number){
        this.graphics = new Graphics();
    }

    public draw(app:Application){
        this.graphics.circle(this.x, this.y, 5);
        this.graphics.fill(0xff0000);

        app.stage.addChild(this.graphics);
    }

}