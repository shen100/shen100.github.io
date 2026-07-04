import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import allStocksRes from './json/all_original_stocks.json' with { type: 'json' }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
for (let i = 0; i < myItems.length; i++) {
    myStocks.push({
        stockFullId: myItems[i].stockFullId,
        stockId: myItems[i].symbol,
        stockName: myItems[i].name
    });
}

try {
    let myStocksStr = JSON.stringify(myStocks, null, 4);
    fs.writeFileSync(path.join(__dirname, 'json', 'all_stocks.json'), myStocksStr, 'utf-8');
    console.log('✅ all_stocks.json 文件写入成功');
} catch (err) {
    console.error('❌ 写入失败:', err);
}