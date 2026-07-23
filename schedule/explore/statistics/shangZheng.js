import { MongoClient } from 'mongodb';

/**
 * start ------------------------------------------------------------
 * 修改 stockFullId, rateConst3, rateConst2, years 变量的值
 * 然后, 运行此文件
 */

// 上证指数
let stockFullId = 'sh000001';
let rateConst3 = 0.03;
let rateConst2 = 0.02;
let nextRateTableTip = `上证指数 跌幅超过 ${rateConst2 * 100}%`

// 科创50
// let stockFullId = 'sh000688';
// let rateConst3 = 0.05;
// let rateConst2 = 0.03;
// let nextRateTableTip = `科创50 跌幅超过 ${rateConst2 * 100}% 的日期如下`

let years = [ 2024, 2025, 2026 ];

/**
 * end --------------------------------------------------------------
 */
const uri = 'mongodb://admin:admin123@127.0.0.1:27017';
const client = new MongoClient(uri);

let rate2List = [];

function getKList(year, list) {
    let startIndex = -1;
    let endIndex = -1;
    for (let i = 0; i < list.length; i++) {
        let theYear = parseInt(list[i].date.split('-')[0]);
        if (theYear === year && startIndex < 0) {
            startIndex = i - 1;
        }
        if (theYear > year && endIndex < 0) {
            endIndex = i;
        }
    }
    endIndex = endIndex >= 0 ? endIndex : list.length;
    return list.slice(startIndex, endIndex);
}

async function analyzePriceChange(year, list) {
    let kList = getKList(year, list);

    let upCount = 0;
    let downCount = 0;

    let up3RateCount = 0;
    let up3RateList = [];
    let up3DateList = [];

    let down3RateCount = 0;
    let down3RateList = [];
    let down3DateList = [];

    for (let i = 1; i < kList.length; i++) {
        let date = kList[i].date;
        // if (date === '2026-07-17') {
        //     console.log();
        // }
        let price1 = kList[i - 1].closePrice;
        let price2 = kList[i].closePrice;
        if (price2 > price1) {
            upCount++;
        }
        if (price2 < price1) {
            downCount++;
        }

        let rate = (price2 - price1) / price1;
        if (rate >= rateConst3) {
            up3RateCount++;
            up3RateList.push((rate * 100).toFixed(2) + '%');
            up3DateList.push(date.substring(5));
        }
        if (rate <= -rateConst3) {
            down3RateCount++;
            down3RateList.push((rate * 100).toFixed(2) + '%');
            down3DateList.push(date.substring(5));
        }

        if (rate <= -rateConst2 && i + 1 < kList.length) {
            let price3 = kList[i + 1].closePrice;
            let nextRate = (price3 - price2) / price2;
            rate2List.push({
                date,
                rate: (rate * 100).toFixed(2) + '%',
                nextRate,
                nextRatePercent: (nextRate * 100).toFixed(2) + '%',
            });
        }
    }
    console.log(`\n${year} 年`);
    console.log(`上涨天数`, upCount);
    console.log(`下跌天数`, downCount);

    console.log(`涨幅 >= ${rateConst3 * 100}% 的天数`, up3RateCount, up3DateList, up3RateList);
    console.log(`跌幅 >= ${rateConst3 * 100}% 的天数`, down3RateCount, down3DateList, down3RateList);
}

(async function() {
    await client.connect();
    console.log('✅ 成功连接到 MongoDB');

    const db = client.db('mytrade');
    const collection = db.collection('kline_index');

    const kLineData = await collection.findOne({ stockFullId });
    if (!kLineData) {
        console.log('kline_index 集合里没数据');
        console.log();
        process.exit(0);
    }

    for (let i = 0; i < years.length; i++) {
        await analyzePriceChange(years[i], kLineData.kList);
    }

    let str = `|     日期    |   跌幅   |    下一交易日涨幅(%)     | 下一交易日涨幅 |
| ----------- | -------- | ------------------------ | -------------- |\n`;
    for (let i = 0; i < rate2List.length; i++) {
        str = str + `| ${rate2List[i].date}  | ${rate2List[i].rate}   |  ${rate2List[i].nextRatePercent} | ${rate2List[i].nextRate}   |\n`;
    }
    console.log('\n' + nextRateTableTip);
    // console.log(JSON.stringify(rate2List));
    console.log();
    console.log(str);
    console.log();
    console.log('done');
    console.log();
}());