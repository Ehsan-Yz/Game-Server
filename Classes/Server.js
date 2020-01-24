let Connection = require('./Connection');
let Player = require('./Player');

//Lobbies
let LobbyBase = require('./Lobbies/LobbyBase');
let GameLobby = require('./Lobbies/GameLobby');
let GameLobbySetting = require('./Lobbies/GameLobbySetting');

module.exports = class Server {
    constructor() {
        this.connections = [];
        this.lobbys = [];

        this.lobbys[0] = new LobbyBase(0);
    }

    //Interval update every 100 milliseconds
    onUpdate() {
        let server = this;

        //update each lobby
        for (let id in server.lobbys) {
            server.lobbys[id].onUpdate();
        }
    }

    //Handle New Connection To The Server
    onConnected(socket) {
        let server = this;
        let connection = new Connection();
        connection.socket = socket;
        connection.player = new Player();
        connection.server = this;

        let player = connection.player;
        let lobbys = server.lobbys;

        console.log("Added New Player To The Server (" + player.id + ")");
        server.connections[player.id] = connection;

        socket.join(player.lobby);
        connection.lobby = lobbys[player.lobby];
        connection.lobby.onEnterLobby(connection);

        return connection;
    }

    onDisconnected(connection = Connection) {
        let server = this;
        let id = connection.player.id;

        delete server.connections[id];
        console.log('player ' + connection.player.displayPlayerInformation() + ' has disconnected');

        //Tell Other players currently in the lobby that we have disconnected from the game
        connection.socket.broadcast.to(connection.player.lobby).emit('disconnected', {
            id: id
        });

        //Perform lobby clean up
        server.lobbys[connection.player.lobby].onLeaveLobby(connection);

    }

    onAttemptToJoinGame(connection = Connection) {
        //Look through lobbies for a gameLobby
        //check if joinable
        //if not make a new game
        let server = this;
        let lobbyFound = false;

        let gameLobbies = server.lobbys.filter(item => {
            return item instanceof GameLobby;
        });
        console.log('Found (' + gameLobbies.length + ') lobbies on the server');

        gameLobbies.forEach(lobby => {
            if (!lobbyFound) {
                let canjoin = lobby.canEnterLobby(connection);

                if (canjoin) {
                    lobbyFound = true;
                    server.onSwitchLobby(connection, lobby.id);
                }
            }
        });

        //All Game Lobbies Full Or We Have Never Created One
        if (!lobbyFound) {
            console.log('Making a new Game Lobby');
            let gameLobby = new GameLobby(gameLobbies.length + 1, new GameLobbySetting('FFA', 2));
            server.lobbys.push(gameLobby);
            server.onSwitchLobby(connection, gameLobby.id);
        }
    }

    onSwitchLobby(connection = Connection, lobbyId) {
        let server = this;
        let lobbys = server.lobbys;

        connection.socket.join(lobbyId); //Join the new lobby's socket channel
        connection.lobby = lobbys[lobbyId]; // assign reference to the new lobby

        lobbys[connection.player.lobby].onLeaveLobby(connection);
        lobbys[lobbyId].onEnterLobby(connection);
    }

}