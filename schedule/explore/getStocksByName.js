import { getAllStocks } from './allStocks.js';

let str = `中控技术
天孚通信
长飞光纤
铜冠铜箔
麦格米特
中天科技
呈和科技
东材科技
江南新材
合锻智能
强瑞技术
电连技术`;

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