let LobbyBase = require('./LobbyBase');
let GameLobbySetting = require('./GameLobbySetting');
let Connection = require('../Connection');
let Bullet = require('../Bullet');

module.exports = class GameLobby extends LobbyBase {
    constructor(id, settings = GameLobbySetting) {
        super(id);
        this.settings = settings;
        this.bullets = [];
    }

    onUpdate() {
        let lobby = this;

        lobby.updateBullets();
        lobby.updateDeadPlayers();

    }

    canEnterLobby(connection = Connection) {
        let lobby = this;
        let maxPlayerCount = lobby.settings.maxPlayer;
        let currentPlayerCount = lobby.connections.length;

        if (currentPlayerCount + 1 > maxPlayerCount) {
            return false;
        }

        return true;
    }

    onEnterLobby(connection = Connection) {
        let lobby = this;
        super.onEnterLobby(connection);

        lobby.addPlayer(connection);

        //Handle Spawning any server spawned objects here
        //example : loot , flying bullets etc

    }

    onLeaveLobby(connection = Connection) {
        let lobby = this;
        super.onLeaveLobby(connection);

        lobby.removePlayer(connection);

        //Handle Spawning any server spawned objects here
        //example : loot , flying bullets etc
    }

    updateBullets() {
        let lobby = this;
        let bullets = lobby.bullets;
        let connections = lobby.connections;

        bullets.forEach(bullet => {
            let isDestroyed = bullet.onUpdate();

            if (isDestroyed) {
                lobby.despawnBullet(bullet);
            } else {
               /* var returnData = {
                    id: bullet.id,
                    position: {
                        x: bullet.position.x,
                        y: bullet.position.y
                    }
                }

                connections.forEach(connection => {
                    connection.socket.emit('updatePosition', returnData)
                })*/
            }
        })
    }

    updateDeadPlayers() {
        let lobby = this;
        let connections = lobby.connections;

        connections.forEach(connection => {
            let player = connection.player;

            if (player.isDead) {
                let isRespawn = player.respawnCounter();

                if (isRespawn) {

                    let returnData = {
                        id: player.id,
                        position: {
                            x: player.position.x,
                            y: player.position.y
                        }
                    }

                    connection.socket.emit('playerRespawn', returnData);
                    connection.socket.broadcast.to(lobby.id).emit('playerRespawn', returnData);
                }
            }
        })
    }

    onFireBullet(connection = Connection, data) {
        let lobby = this;

        let bullet = new Bullet();
        bullet.name = 'Bullet';
        bullet.activator = data.activator;
        bullet.position.x = data.position.x;
        bullet.position.y = data.position.y;
        bullet.direction.x = data.direction.x;
        bullet.direction.y = data.direction.y;

        lobby.bullets.push(bullet);

        var returnData = {
            name: bullet.name,
            id: bullet.id,
            activator: bullet.activator,
            position: {
                x: bullet.position.x,
                y: bullet.position.y
            },
            direction: {
                x: bullet.direction.x,
                y: bullet.direction.y
            },
            speed:bullet.speed
        }

        connection.socket.emit('serverSpawn', returnData);
        connection.socket.broadcast.to(lobby.id).emit('serverSpawn', returnData);
    }

    onCollisionDestroy(connection = Connection, data) {
        let lobby = this;

        let returnBullets = lobby.bullets.filter(bullet => {
            return bullet.id == data.id;
        });

        returnBullets.forEach(bullet => {
            let playerHit = false;

            lobby.connections.forEach(connection => {
                let player = connection.player;

                if (bullet.activator != player.id) {
                    let distance = bullet.position.Distance(player.position);

                    if (distance < 0.65) {
                        playerHit = true;
                        let isDead = player.dealDamage(50); //Take half of health for testing
                        if (isDead) {
                            console.log("player with id: " + player.id + 'has died');
                            let returnData = {
                                id: player.id
                            }
                            connection.socket.emit('playerDied', returnData);
                            connection.socket.broadcast.to(lobby.id).emit('playerDied', returnData);
                        } else {
                            console.log('player with id: ' + player.id + ' has (' + player.health + ") health left");
                        }
                        lobby.despawnBullet(bullet);
                    }
                }

            });

            if (!playerHit) {
                bullet.isDestroyed = true;
            }
        })
    }

    despawnBullet(bullet = Bullet) {
        let lobby = this;
        let bullets = lobby.bullets;
        let connections = lobby.connections;

        console.log('Destroying bullet ( ' + bullet.id + ")");
        var index = bullets.indexOf(bullet);
        if (index > -1) {
            bullets.splice(index, 1);

            var returnData = {
                id: bullet.id
            }

            //send remove bullet command to players
            connections.forEach(connection => {
                connection.socket.emit('serverUnSpawn', returnData)
            });
        }
    }

    addPlayer(connection = Connection) {
        let lobby = this;
        let connections = lobby.connections;
        let socket = connection.socket;

        var returnData = {
            id: connection.player.id
        }

        socket.emit('spawn', returnData); //Tell myself i have Spawned
        socket.broadcast.to(lobby.id).emit('spawn', returnData); //Tell Others

        //Tell myself about everyone else already in the lobby
        connections.forEach(c => {
            if (c.player.id != connection.player.id) {
                socket.emit('spawn', {
                    id: c.player.id
                });
            }
        });
    }

    removePlayer(connection = Connection) {
        let lobby = this;

        connection.socket.to(lobby.id).emit('disconnected', {
            id: connection.player.id
        })
    }

}