var shortId = require('shortid');
var Vector2 = require('./Vector2');

module.exports = class player {
    constructor() {
        this.username = 'Default_Player';
        this.id = shortId.generate();
        this.lobby = 0;
        this.position = new Vector2();
        this.tankRotation = new Number(0);
        this.barrelRotation = new Number(0);
        this.health = new Number(100);
        this.isDead = false;
        this.respawnTicker = new Number(0);
        this.respawnTime = new Number(0);
    }

    displayPlayerInformation() {
        let player = this;
        return "(" + player.username + ":" + player.id + ")";
    }

    respawnCounter() {
        this.respawnTicker = this.respawnTicker + 1;

        if (this.respawnTicker >= 10) {
            this.respawnTicker = new Number(0);
            this.respawnTime = this.respawnTime + 1;

            //Three Seccond Respawn Time
            if (this.respawnTime >= 3) {
                console.log("respawn player id : " + this.id);
                this.isDead = false;
                this.respawnTicker = new Number(0);
                this.respawnTime = new Number(0);
                this.health = new Number(100);
                this.position = new Vector2(-8, 3);

                return true;
            }
        }

        return false;
    }

    dealDamage(amount = Number) {
        //Adjust Health on getting hit
        this.health = this.health - amount;

        //Check If We Are Dead
        if (this.health <= 0) {
            this.isDead = true;
            this.respawnTicker = new Number(0);
            this.respawnTime = new Number(0);
        }

        return this.isDead;
    }
};