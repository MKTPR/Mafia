const Client = require('socket.io-client');
const CreateLobbyDTO = require('../domain/DTO/request/CreateLobbyDTO');
const config = require('../config.json');
const SocketIOServer = require('../index');

describe('Create-lobby event test', () => {
    let clientSocket;
    const port = process.env.PORT || config.local_port;

    beforeEach((done) => {
        clientSocket = new Client(`http://localhost:${port}`);
        clientSocket.on('connect', done);
    });

    // Disconnect each socket connected to the server
    afterEach((done) => {
        const { sockets } = SocketIOServer.io.sockets;

        // Iterate through each connected client and disconnect them.
        sockets.forEach((socket, key) => {
            socket.disconnect(true);
        });

        done();
    });

    // Close the server once all tests are done
    afterAll(() => {
        SocketIOServer.server.close();
    });

    test('Simple create lobby events', (done) => {
        const createLobbyDTO = new CreateLobbyDTO('Anmol');

        // Subscribe to lobby-code
        clientSocket.on('lobby-code', (lobbyCodeDTO) => {
            expect(lobbyCodeDTO.code).toBeDefined();
            done();
        });

        // Request to create a new lobby
        clientSocket.emit('create-lobby', createLobbyDTO);
    });

    test('Two hosts with two rooms', (done) => {
        const createLobbyDTO = new CreateLobbyDTO('Anmol');

        // Client 1 to subscribe to lobby-code
        clientSocket.on('lobby-code', (lobbyCodeDTO) => {
            expect(lobbyCodeDTO.code).toBeDefined();
            // Wait for the other client to throw errors, if there are any.
            setTimeout(() => {
                done();
            }, 1000);
        });

        const clientSocket2 = new Client(`http://localhost:4001`);
        // Client 2 to subscribe to lobby-code
        clientSocket2.on('lobby-code', (lobbyCodeDTOString) => {
            throw new Error("Client 2 shouldn't receive a lobby code");
        });

        // Request to create a new lobby
        clientSocket.emit('create-lobby', createLobbyDTO);
    });

    test('Host starts game event', (done) => {
        const createLobbyDTO = new CreateLobbyDTO('Anmol');

        // Request to create a new lobby
        // this will set the socket id to the host to be tested.
        clientSocket.emit('create-lobby', createLobbyDTO);

        // Subscribe to game start event
        // server should send this event back once host clicks start.
        // Client to subscribe to "game-start"
        clientSocket.on('game-start', () => {
            done();
        });

        // Request to server that game is ready to be started.
        clientSocket.emit('start-game');
    });

    test('Reset lobby', (done) => {
        const createLobbyDTO = new CreateLobbyDTO('Anmol');

        // Subscribe to lobby-code
        clientSocket.on('lobby-code', (lobbyCodeDTO) => {
            expect(lobbyCodeDTO.code).toBeDefined();
            // Only emit reset-lobby once lobby code has been received
            clientSocket.emit('reset-lobby');
        });

        // Finish test once reset-lobby-update has been received
        clientSocket.on('reset-lobby-update', () => {
            done();
        });

        // Request to create a new lobby
        clientSocket.emit('create-lobby', createLobbyDTO);
    });
});