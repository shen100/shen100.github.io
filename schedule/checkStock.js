// const schedule = require('node-schedule');
// const axios = require('axios'); // 一个方便处理 HTTP 请求的库

// // 定义要请求的 URL
// const apiUrl = 'https://sqt.gtimg.cn/?q=sh588000&fmt=json&app=wzq&t=1757558180298';

// // 定义一个规则对象，表示每小时的 0 分钟执行（例如 13:00, 14:00）
// const hourlyRule = new schedule.RecurrenceRule();
// hourlyRule.minute = 0; // 每小时的 0 分

// // 也可以使用 Cron 表达式，效果相同
// // const cronRule = '0 * * * *'; // 每分钟的第 0 秒，每小时的每一分钟（但通常我们指整点）

// // 创建定时任务
// const job = schedule.scheduleJob(hourlyRule, async function () {
//   console.log('开始执行定时请求任务:', new Date().toLocaleString());

//   try {
//     // 使用 axios 发送 GET 请求
//     const response = await axios.get(apiUrl, {
//       timeout: 10000, // 设置超时时间（毫秒）
//       // 还可以添加其他请求头等，根据需要配置
//       // headers: { 'User-Agent': 'your-user-agent' }
//     });

//     // 检查 HTTP 状态码
//     if (response.status === 200) {
//       console.log('请求成功，数据:', JSON.stringify(response.data));
//       // 这里可以添加处理返回数据的逻辑
//       // 例如：解析 response.data, 存入数据库等
//     } else {
//       console.warn(`请求返回异常状态码: ${response.status}`);
//     }
//   } catch (error) {
//     // 处理请求中可能出现的错误（如网络问题、超时、JSON 解析错误等）
//     console.error('请求失败:', error.message);
//   }
// });

// console.log('定时任务已启动，将在每小时的第 0 分钟执行...');

// // 优雅地处理进程退出，以便取消任务
// process.on('SIGINT', function () {
//   console.log('\n正在停止定时任务...');
//   job.cancel();
//   process.exit();
// });

console.log('checkStock cron run');