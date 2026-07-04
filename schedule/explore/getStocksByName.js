import { getAllStocks } from './allStocks.js';

let str = `中际旭创
东山精密
生益科技
亨通光电
光迅科技
中天科技
永鼎股份
仕佳光子
中瓷电子
云南锗业
联瑞新材
裕同科技
华兴源创
东威科技
呈和科技
华宏科技
双星新材
赛微微电
杭电股份
隆扬电子
鼎泰高科
强瑞技术
中富电路
光库科技
新易盛
沪电股份
杰瑞股份
强一股份
山东玻纤
博敏电子
宏和科技
剑桥科技
英诺激光
云意电气
中材科技
三祥新材`;

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

console.log(JSON.stringify(myStocks));