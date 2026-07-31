import { Server } from 'socket.io';

const socketMap = {};

export function init(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: '*'
        },
        pingInterval: 5000,   // 5秒发一次ping
        pingTimeout: 8000     // 8秒没回应就断开
    });

    io.on('connection', (socket) => {
        console.log('a user connected', socket.id);
        socketMap[socket.id] = socket;
        socket.on('disconnect', () => {
            console.log('客户端断开', socket.id);
            delete socketMap[socket.id];
        });

        socket.emit('socketId', socket.id);
    });
}

export function getSocketClient(socketId) {
    return socketMap[socketId];
}