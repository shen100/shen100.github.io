import express from 'express';
import path from 'path';
import * as mongo from './database/mongo.js';
import * as router from './router/router.js';

const app = express();
const PORT = 3000;

await mongo.init();

// ============ 中间件配置 ============

// 解析 JSON 请求体
app.use(express.json());

// 解析 URL 编码的请求体
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（放在 public 文件夹）
app.use(express.static('public'));

router.init(app);

// 自定义日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ============ 路由配置 ============

// GET 请求 - 首页
app.get('/', (req, res) => {
    res.send(`
        <h1>Express Demo</h1>
        <p>欢迎来到 Express 演示应用</p>
        <ul>
            <li><a href="/about">关于页面</a></li>
            <li><a href="/api/users">用户 API</a></li>
            <li><a href="/public-demo">静态文件演示</a></li>
        </ul>
    `);
});

// GET 请求 - 关于页面
app.get('/about', (req, res) => {
    res.json({
        name: 'Express Demo',
        version: '1.0.0',
        description: '一个简单的 Express 演示应用'
    });
});

// GET 请求 - 获取用户列表
app.get('/api/users', (req, res) => {
    const users = [
        { id: 1, name: '张三', email: 'zhangsan@example.com' },
        { id: 2, name: '李四', email: 'lisi@example.com' },
        { id: 3, name: '王五', email: 'wangwu@example.com' }
    ];
    res.json({
        success: true,
        data: users,
        total: users.length
    });
});

// GET 请求 - 获取单个用户
app.get('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const users = [
        { id: 1, name: '张三', email: 'zhangsan@example.com' },
        { id: 2, name: '李四', email: 'lisi@example.com' },
        { id: 3, name: '王五', email: 'wangwu@example.com' }
    ];
    
    const user = users.find(u => u.id === userId);
    
    if (user) {
        res.json({
            success: true,
            data: user
        });
    } else {
        res.status(404).json({
            success: false,
            message: '用户不存在'
        });
    }
});

// POST 请求 - 创建用户
app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: '姓名和邮箱是必填项'
        });
    }
    
    // 模拟创建用户
    const newUser = {
        id: Date.now(),
        name,
        email,
        createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
        success: true,
        message: '用户创建成功',
        data: newUser
    });
});

// PUT 请求 - 更新用户
app.put('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const { name, email } = req.body;
    
    // 模拟更新用户
    res.json({
        success: true,
        message: `用户 ${userId} 更新成功`,
        data: { id: userId, name, email }
    });
});

// DELETE 请求 - 删除用户
app.delete('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    
    res.json({
        success: true,
        message: `用户 ${userId} 删除成功`
    });
});

// 查询参数示例
app.get('/api/search', (req, res) => {
    const { q, limit = 10, page = 1 } = req.query;
    
    res.json({
        success: true,
        query: q,
        limit: parseInt(limit),
        page: parseInt(page),
        results: [`搜索结果 1`, `搜索结果 2`, `搜索结果 3`]
    });
});

// ============ 错误处理中间件 ============

// 404 处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '路由不存在'
    });
});

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('错误:', err.stack);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

// ============ 启动服务器 ============

app.listen(PORT, () => {
    console.log(`🚀 服务器已启动`);
    console.log(`📡 访问地址: http://localhost:${PORT}`);
    console.log(`📝 按 Ctrl+C 停止服务器`);
});