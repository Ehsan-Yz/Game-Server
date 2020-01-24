module.exports = class Connection {
    constructor() {
        this.socket;
        this.player;
        this.server;
        this.lobby;
    }

    //Handle All Our io Events and where we should route them to be handled
    createEvents() {
        let connection = this;
        let socket = connection.socket;
        let player = connection.player;
        let server = connection.server;

        socket.on('disconnect', function () {
            server.onDisconnected(connection);
        });

        socket.on('joinGame', function () {
            server.onAttemptToJoinGame(connection);
        });

        socket.on('fireBullet', function (data) {
            connection.lobby.onFireBullet(connection, data);
        });

        socket.on('collisionDestroy', function (data) {
            connection.lobby.onCollisionDestroy(connection, data);
        });

        socket.on('updatePosition', function (data) {
            player.position.x = data.position.x;
            player.position.y = data.position.y;

            socket.broadcast.to(connection.lobby.id).emit('updatePosition', player);
        });

        socket.on('updateRotation', function (data) {
            player.tankRotation = data.tankRotation;
            player.barrelRotation = data.barrelRotation;

            socket.broadcast.to(connection.lobby.id).emit('updateRotation', player);
        });

    }

}