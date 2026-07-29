import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import allStocksRes from '../data/all_original_stocks.json' with { type: 'json' }
import * as mongo from '../database/mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
股票数据 - 基础数据 - 股票列表

接口: stock_basic

allStocksRes 的数据结构

{
    "code": 0,
    "message": "",
    "data": {
        "fields": [
            "ts_code",
            "symbol",
            "name",
            "area",
            "industry",
            "cnspell",
            "market",
            "list_date",
            "act_name",
            "act_ent_type"
        ],
        "items": [
            [
                "000001.SZ",
                "000001",
                "平安银行",
                "深圳",
                "银行",
                "PAYH",
                "主板",
                "19910403",
                "无实际控制人",
                "无"
            ]
        ],
        "has_more": false,
        "count": 0
    },
    "request_id": "be73a421-2016-4fa1-9fef-adda080a5fb8",
    "chart": null
}
*/

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
        stockName: myItems[i].name,
    });
}

export function getAllStocksFromFile() {
    return myStocks;
}

export async function getAllStocksFromDB() {
    const db = await mongo.getDB();
    const stockDetailCol = db.collection('stock_detail');
    const stocks = await stockDetailCol.find({}).toArray();
    return stocks;
}