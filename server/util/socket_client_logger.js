import * as socket from '../socket/socket.js';

export function getLogger(socketId) {
    let socketClient = socket.getSocketClient(socketId)
    if (!socketClient) {
        return null;
    }
    return {
        info: function(message) {
            socketClient.emit('log', message);
        }
    };
}

export function info() {
    socket.getSocket()
}