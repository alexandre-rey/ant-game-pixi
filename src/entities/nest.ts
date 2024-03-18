import { Application, Graphics, Text } from "pixi.js";

export class Nest {

    public graphics: Graphics;
    private text: Text;
    private foodCount: number = 0;

    constructor(public x: number, public y: number) {
        this.graphics = new Graphics();
        this.text = new Text(
            this.foodCount.toString(),
            {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xff0000,
                align: 'center'
            });
    }

    public draw(app: Application) {
        this.graphics.circle(this.x, this.y, 40);
        this.graphics.fill(0x964B00);
        app.stage.addChild(this.graphics);

        this.text.x = this.x - this.text.width / 2;
        this.text.y = this.y - this.text.height / 2;
        app.stage.addChild(this.text);
    }

    public addFood() {
        this.foodCount += 1;
        this.text.text = this.foodCount.toString();
        this.text.x = this.x - this.text.width / 2;
        this.text.y = this.y - this.text.height / 2;
    }

}