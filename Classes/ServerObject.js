var shortId = require('shortid');
var vector2 = require('./Vector2');

module.exports = class ServerObject {
    constructor() {
        this.id = shortId.generate();
        this.name = 'ServerObject';
        this.position = new vector2();
    }
}