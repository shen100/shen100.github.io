import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllStocks } from './allStocks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let str = `西部矿业
三祥新材
宝武镁业
拓斯达
汇川技术
凌云光
能科科技
雷赛智能
长盈精密
汉威科技
浙江荣泰
智微智能
中控技术
兆威机电
中大力德
蓝思科技
柯力传感
奥比中光-W
大族激光
五洲新春
拓普集团
绿的谐波
双环传动
机器人
石头科技
昊志机电
盈峰环境
埃斯顿
震裕科技
科沃斯
三花智控
鸣志电器
福临精工`;

let allStocks = getAllStocks();
let stocks = str.split('\n');
let myStocks = [];

for (let i = 0; i < stocks.length; i++) {
    for (let j = 0; j < allStocks.length; j++) {
        if (stocks[i] === allStocks[j].stockName) {
            myStocks.push({
                "stockFullId": allStocks[j].stockFullId,
                "stockId": allStocks[j].stockId,
                "stockName": allStocks[j].stockName,
            });
            break;
        }
    }
}

try {
    let jsonStr = JSON.stringify(myStocks, null, 4);
    fs.writeFileSync(path.join(__dirname, 'json', 'stock_by_name.json'), jsonStr, 'utf-8');
    console.log('✅ stock_by_name.json 文件写入成功');
} catch (err) {
    console.error('❌ 写入失败:', err);
}