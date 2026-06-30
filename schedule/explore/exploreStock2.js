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

let startStr = '2025-01-01';
let endStr = '2026-06-29'; // new Date().toISOString().substring(0, 10);
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



function detectDowntrend(allItems) {
    let rightIndex = -11;
    const items = allItems.slice(rightIndex);

    let passed = false;
    let trendChangePointIndex = -1;
    for (let i = -rightIndex; i >= 2; i--) {
        let maxPrice = 0;
        let maxPriceIndex = -1;
        let minPrice = 100000000;
        let minPriceIndex = -1;
        let index = items.length - i;
        for (let j = index + 1; j < items.length; j++) {
            if (items[j].closePrice > maxPrice) {
                maxPrice = items[j].closePrice;
                maxPriceIndex = j;
            }
            if (items[j].closePrice < minPrice) {
                minPrice = items[j].closePrice;
                minPriceIndex = j;
            }
        }
        let downRate = (items[index].closePrice - minPrice) / items[index].closePrice;
        if (items[index].closePrice > maxPrice && downRate > 0.15) {
            passed = true;
            trendChangePointIndex = allItems.length - items.length + index;
            break;
        }
    }

    if (!passed) {
        return false;
    }
    if (trendChangePointIndex >= allItems.length - 2) {
        return false;
    }
    for (let i = 0; i < trendChangePointIndex; i++) {
        if (allItems[i].highPrice > allItems[trendChangePointIndex].closePrice) {
            return false;
        }
    }
    return true;
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

        let highPriceDate = '';
        let highPriceInAll = 0;

        let kListData = myKList.map((item) => {
            if (item[3] > highPriceInAll) {
                highPriceInAll = item[3];
                highPriceDate = item[0];
            }
            return { date: item[0], closePrice: item[2], highPrice: item[3] }
        });

        if (kListData.length < 100) {
            return;
        }

        if (stockData.name === '凌云光') {
            console.log();
        }

        if (!detectDowntrend(kListData)) {
            return;
        }

        // let trendData = findBestTrendReversalWithRegression(kListData);
        // if (stockData.name === '厦钨新能') {
        //     console.log('findBestTrendReversalWithRegression', {
        //         ...trendData,
        //         stockName: stockData.name
        //     });
        // }

        // console.log(highPriceDate.substring(0, 4), new Date().toISOString().substring(0, 4));

        // if (highPriceDate.substring(0, 4) !== new Date().toISOString().substring(0, 4)) {
        //     return;
        // }

        // if (!trendData || trendData.n < 15 || trendData.m < 2) {
        //     return;
        // }

        let theStock = {
            stockFullId: stockData.stockFullId,
            stockId: stockData.symbol,
            stockName: stockData.name
        }
        let stockDetail = await requestStockDetail(stockDetailJSONMap, theStock);
        stockDetailJSONMap[stockData.stockFullId] = stockDetail;

        if (stockDetail.zongShiZhi > 100) {
            return;
        }
        stocks.push(theStock);
    }, { concurrency: 20 });

    // console.log('stocks', JSON.stringify(stocks));

    try {
        fs.writeFileSync( path.join(__dirname, 'json', 'stock_day.json'), JSON.stringify(dayJSONMap, null, 2), 'utf-8');
        console.log('✅ 文件写入成功');

        fs.writeFileSync( path.join(__dirname, 'json', 'stock_detail.json'), JSON.stringify(stockDetailJSONMap, null, 2), 'utf-8');
        console.log('✅ 文件写入成功');

        fs.writeFileSync( path.join(__dirname, 'json', 'stocks_pool.json'), JSON.stringify(stocks, null, 2), 'utf-8');
        console.log('✅ 文件写入成功');
    } catch (err) {
        console.error('❌ 写入失败:', err);
    }
}());

