module.exports = class Vector2 {
    constructor(X = 0, Y = 0) {
        this.x = X
        this.y = Y
    }

    Magnitude() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y))
    }

    Normalized() {
        var mag = this.Magnitude()
        return new Vector2(this.x / mag, this.y / mag)
    }

    Distance(OtherVec = Vector2){
        var direction = new Vector2()
        direction.x = OtherVec.x - this.x
        direction.y = OtherVec.y - this.y
        return direction.Magnitude()
    }

    ConsoleOutPut(){
        return "(" + this.x + "," + this.y + ")"
    }
}