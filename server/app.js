import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import * as mongo from './database/mongo.js';
import * as router from './router/router.js';
import * as socket from './socket/socket.js';

const PORT = 3000;

const app = express();
const httpServer = createServer(app);

await mongo.init();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));

// 自定义日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

router.init(app);

// 404 处理
app.use((req, res) => {
    res.status(404).json({
        code: 1,
        message: '路由不存在'
    });
});

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('错误:', err.stack);
    res.status(500).json({
        code: 1,
        message: '服务器内部错误'
    });
});

socket.init(httpServer);

httpServer.listen(PORT, () => {
    console.log(`🚀 服务器已启动`);
    console.log(`📡 访问地址: http://localhost:${PORT}`);
    console.log(`📝 按 Ctrl+C 停止服务器`);
});