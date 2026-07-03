import { allStocksRes } from './allStocks.js';

let str = `中控技术
天孚通信
长飞光纤
铜冠铜箔
麦格米特
中天科技
呈和科技`;

let stocks = str.split('\n');


let fields = allStocksRes.data.fields;
let myItems = [];

(function() {
    for (let i = 0; i < allStocksRes.data.items.length; i++) {
        let myItem = {};
        let item = allStocksRes.data.items[i];
        for (let j = 0; j < fields.length; j++) {
            myItem[fields[j]] = item[j];
            let arr = myItem.ts_code.split('.');
            myItem.stockFullId = arr[1].toLowerCase() + arr[0];
        }
        myItems.push(myItem);
    }
}());

console.log('全部股票数量:', myItems.length);
console.log('股票数据结构:', myItems[myItems.length - 1]);

let myStocks = [];
for (let i = 0; i < stocks.length; i++) {
    for (let j = 0; j < myItems.length; j++) {
        if (stocks[i] === myItems[j].name) {
            myStocks.push({
                "stockFullId": myItems[j].stockFullId,
                "stockId": myItems[j].symbol,
                "stockName": myItems[j].name,
            });
        }
    }
}

console.log(JSON.stringify(myStocks));