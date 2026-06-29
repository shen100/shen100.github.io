import bluebird from 'bluebird';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requestStockDetail, requestDayK, requestMonthK } from './stockUtil.js';
import { parseLocalYMDString } from '../../src/modules/trade/util/date.js';
import { allStocksRes } from './json/allStocks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let fields = allStocksRes.data.fields;
let myItems = [];

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

console.log('myItems', myItems[myItems.length - 1]);

let startStr = '2026-06-01';
let endStr = new Date().toISOString().substring(0, 10);
console.log();
console.log('startStr', startStr);
console.log('endStr', endStr);
console.log();

let startDate = parseLocalYMDString(startStr);
let endDate = parseLocalYMDString(endStr);
let count = Math.floor((endDate - startDate) / (24 * 3600 * 1000));

function convertKListToNumbers(myKList) {
    for (let i = 0; i < myKList.length; i++) {
        myKList[i][1] = Number(myKList[i][1]);
        myKList[i][2] = Number(myKList[i][2]);
        myKList[i][3] = Number(myKList[i][3]);
        myKList[i][4] = Number(myKList[i][4]);
        myKList[i][5] = Number(myKList[i][5]);
    }
}

function getPreviousMonth(date = new Date()) {
    const d = new Date(date);
    // 注意：getMonth() 返回 0-11，减 1 后若为 -1，则自动变为上一年的 11 月
    d.setMonth(d.getMonth() - 1);
    return d;
}

let stocks = [];

// myItems = myItems.slice(0, 1);

// myItems = [
//     {
//         stockFullId: 'sz301200',
//         symbol: '301200',
//         name: '大族数控'
//     }
// ];

// act_ent_type =
// '无'
// act_name =
// '无实际控制人'
// area =
// '深圳'
// cnspell =
// 'PAYH'
// industry =
// '银行'
// list_date =
// '19910403'
// market =
// '主板'
// name =
// '平安银行'
// stockFullId =
// 'sz000001'
// symbol =
// '000001'
// ts_code =
// '000001.SZ'



function findBestTrendReversalWithRegression(data) {
    if (data.length < 20) return null;
    
    const last20 = data.slice(-20);
    let bestMatch = null;
    let bestScore = -Infinity;
    
    for (let n = 10; n <= 19; n++) {
        const firstN = last20.slice(0, n);
        const lastM = last20.slice(n);
        
        // 使用线性回归计算斜率
        const firstNSlope = calculateSlope(firstN);
        const lastMSlope = calculateSlope(lastM);
        
        // 前N个上升（斜率>0），后M个下降（斜率<0）
        if (firstNSlope > 0 && lastMSlope < 0) {
            // 综合得分：上升斜率绝对值 + 下降斜率绝对值
            const score = Math.abs(firstNSlope) + Math.abs(lastMSlope);
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = {
                    n,
                    m: 20 - n,
                    firstNSlope: firstNSlope,
                    lastMSlope: lastMSlope,
                    score: score
                };
            }
        }
    }
    
    return bestMatch;
}

function calculateSlope(prices) {
    if (prices.length < 2) return 0;
    
    const n = prices.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
        const x = i;
        const y = prices[i].closePrice;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
    }
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}

(async function() {
    let dayJSONMap = {};
    let stockDetailJSONMap = {};
    try {
        let dayJSONStr = fs.readFileSync(path.join(__dirname, 'json', 'stock_day.json'), 'utf-8');
        dayJSONMap = JSON.parse(dayJSONStr);

        let stockDetailJSONStr = fs.readFileSync(path.join(__dirname, 'json', 'stock_detail.json'), 'utf-8');
        stockDetailJSONMap = JSON.parse(stockDetailJSONStr);
    } catch (err) {
        console.log(err);
    }

    await bluebird.map(myItems, async function (stockData, index) {
        console.log(index, 'requestDayK\n');
        // console.log('stockData', stockData);
        let myKList = await requestDayK(dayJSONMap, stockData, startStr, endStr, count);
        convertKListToNumbers(myKList);

        let keyInMap = `${stockData.stockFullId}-${startStr}-${endStr}-${count}`;
        dayJSONMap[keyInMap] = myKList;

        let highPriceInAll = -10000000;
        let date = '';

        let kListData = myKList.map((item) => {
            return { date: item[0], closePrice: item[2] }
        });
        console.log('findBestTrendReversalWithRegression', findBestTrendReversalWithRegression(kListData));

        let theStock = {
            stockFullId: stockData.stockFullId,
            stockId: stockData.symbol,
            stockName: stockData.name
        }
        let stockDetail = await requestStockDetail(stockDetailJSONMap, theStock);
        stockDetailJSONMap[stockData.stockFullId] = stockDetail;
        return;

        // if (stockDetail.zongShiZhi < 100) {
        //     return;
        // }
    }, { concurrency: 20 });

    console.log('stocks', JSON.stringify(stocks));

    try {
        fs.writeFileSync( path.join(__dirname, 'json', 'stock_day.json'), JSON.stringify(dayJSONMap, null, 2), 'utf-8');
        console.log('✅ 文件写入成功');

        fs.writeFileSync( path.join(__dirname, 'json', 'stock_detail.json'), JSON.stringify(stockDetailJSONMap, null, 2), 'utf-8');
        console.log('✅ 文件写入成功');
    } catch (err) {
        console.error('❌ 写入失败:', err);
    }
}());

