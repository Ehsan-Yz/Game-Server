var serverobject = require('./ServerObject');
var vector2 = require('./Vector2');

module.exports= class Bullet extends serverobject{
    constructor(){
        super();
        this.direction = new vector2();
        this.speed = 0.5;
        this.isDestroyed = false;
        this.activator = '';
    }

    onUpdate(){

        this.position.x += this.direction.x * this.speed;
        this.position.y += this.direction.y * this.speed;

        return this.isDestroyed;
    }
}