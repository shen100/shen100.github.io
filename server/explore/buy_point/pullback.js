import { MongoClient } from 'mongodb';
import bluebird from 'bluebird';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as strategy1 from '../strategy/strategy1.js';
import * as strategy2 from '../strategy/strategy2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = 'mongodb://admin:admin123@127.0.0.1:27017';
const client = new MongoClient(uri);

function findMaxClosePrice(list) {
    let maxClosePrice = 0;
    let date = '';
    for (let i = 0; i < list.length; i++) {
        let item = list[i];
        if (item.closePrice > maxClosePrice) {
            maxClosePrice = item.closePrice;
            date = item.date;
        }
    }
    return {
        maxClosePrice,
        date
    }
}

function getProfit(stock) {
    if (!(stock && stock.tradeActions && stock.tradeActions.length)) {
        return 0;
    }
    let buyAmount = 0;
    let sellAmount = 0;
    let remainingCount = 0;
    for (let i = 0; i < stock.tradeActions.length; i++) {
        let action = stock.tradeActions[i];
        if (action.type === 'buy') {
            buyAmount += (action.price * action.count);
            remainingCount += action.count;
        } else if (action.type === 'sell') {
            sellAmount += (action.price * action.count);
            remainingCount -= action.count;
        }
    }
    let finalAmount = sellAmount;
    return finalAmount - buyAmount;
}

async function buyByPullback(db, stock, option) {
    const klineDayCol = db.collection('kline_day');
    const stockKLine = await klineDayCol.findOne({ stockId: stock.stockId });

    let index = -1;
    for (let i = 0; i < stockKLine.kList.length; i++) {
        if (stock.stockId === '300026') {
            console.log();
        }
        if (stockKLine.kList[i].date >= option.start) {
            index = i;
            break;
        }
    }
    let kList = stockKLine.kList.slice(index);

    let pullbackIndex = -1;
    for (let i = 0; i < kList.length; i++) {
        if (kList[i].date >= option.pullbackDate) {
            pullbackIndex = i + 1;
            break;
        }
    }
    let pullbackList = kList.slice(0, pullbackIndex);

    let result = {
        stockFullId: stock.stockFullId,
        stockId: stock.stockId,
        stockName: stock.stockName,
        highPrice: 0,
        stopPrice: 0,
        tradeActions: []
    };

    let prevMax = findMaxClosePrice(pullbackList);
    result.highPrice = prevMax.maxClosePrice;
    let count = 0;
    let amount = 10000;
    let buyPrice = 0;
    let maxRate = 0;
    let maxClosePrice = 0;

    if (stock.stockName === '沙河股份') {
        console.log();
    }

    if (!strategy1.detectTrend(pullbackList, stock).ok) {
        return result;
    }

    let pullbackData = pullbackList[pullbackList.length - 1];
    buyPrice = pullbackData.closePrice;
    count = amount / buyPrice;
    maxClosePrice = buyPrice;
    result.tradeActions.push({ type: 'buy', date: pullbackData.date, price: buyPrice, count });


    for (let i = pullbackIndex; i < kList.length; i++) {
        let kData = kList[i];
        if (kData.date >= option.end) {
            break;
        }

        if (kData.closePrice > maxClosePrice) {
            maxClosePrice = kData.closePrice;
        }
        let rate = (kData.closePrice - buyPrice) / buyPrice;
        if (rate > maxRate) {
            maxRate = rate;
        }
        if (rate <= -0.05) {
            // 亏损 5% 时，止损
            result.tradeActions.push({ type: 'sell', date: kData.date, price: kData.closePrice, count });
            break;
        }
        if (maxRate >= 0.1 && rate <= maxRate / 2) {
            // 已经获得了超过 10% 的利润，回撤了一半利润，卖出
            result.tradeActions.push({ type: 'sell', date: kData.date, price: kData.closePrice, count });
            break;
        }
        let rate2 = (maxClosePrice - kData.closePrice) / maxClosePrice;
        if (rate2 >= 0.1) {
            // 最大利润，回撤了 10% 的利润，卖出
            result.tradeActions.push({ type: 'sell', date: kData.date, price: kData.closePrice, count });
            break;
        }
    }

    return result
}

async function main() {
    await client.connect();
    console.log('✅ 成功连接到 MongoDB');

    const db = client.db('mytrade');
    const stockDetailCol = db.collection('stock_detail');
    const stockList = await stockDetailCol.find({}).toArray();

    let output = [];
    let sumProfit = 0;
    for (let i = 0; i < stockList.length; i++) {
        let stock = stockList[i];
        if (stock.stockName.indexOf('银行') > 0) {
            continue;
        }
        if (stock.stockName.indexOf('证券') > 0) {
            continue;
        }
        if (stock.stockName.indexOf('保险') > 0) {
            continue;
        }
        let stockResult = await buyByPullback(db, stock, {
            start: '2025-10-01',
            end: '2026-07-23',
            pullbackDate: '2026-03-24',
        });
        if (!stockResult.tradeActions.length) {
            continue;
        }
        output.push(stockResult);
        let profit = getProfit(stockResult);
        sumProfit += profit;
    }
    
    // console.log(JSON.stringify(output));

    fs.writeFileSync(path.join(__dirname, 'json', 'stocks.json'), JSON.stringify(output), 'utf-8');
    console.log('✅ stocks.json 文件写入成功');

    console.log('总收益', sumProfit);
    console.log();
}

(async function() {
    try {
        await main();
    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        await client.close();
    }
}());