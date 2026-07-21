import { requestDayK } from '../stockUtil.js';
import { data2024 } from './data/shang_zheng/2024.js';
import { data2025 } from './data/shang_zheng/2025.js';
import { data2026 } from './data/shang_zheng/2026.js';

// https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=sh000001,day,2025-01-01,2026-01-01,400,qfq


let rate2List = [];

async function analyzePriceChange(stockFullId, startStr, endStr, count, dataInYear) {
    const stockData = {
        stockFullId
    };
    let key = `${stockData.stockFullId}-${startStr}-${endStr}-${count}`;
    let dayJSONMap = {
        [key]: dataInYear.data.sh000001.day,
    };
    let myKList = await requestDayK(dayJSONMap, stockData, startStr, endStr, count);
  /*
    [
		"2021-03-10", 0-交易日
		"1977.000", 1-开盘价
		"1970.010", 2-收盘价
		"1999.870", 3-最高价
		"1967.000", 4-最低价
		"51172.000" 5-总手
	]
    */
    let upCount = 0;
    let downCount = 0;

    let up3RateCount = 0;
    let down3RateCount = 0;
    let up3RateList = [];
    let down3RateList = [];
    let up3DateList = [];
    let down3DateList = [];
    for (let i = 1; i < myKList.length; i++) {
        let date = myKList[i][0];
        if (date === '2026-07-17') {
            console.log();
        }
        let price1 = myKList[i - 1][2];
        let price2 = myKList[i][2];
        if (price2 > price1) {
            upCount++;
        }
        if (price2 < price1) {
            downCount++;
        }

        let rate = (price2 - price1) / price1;
        if (rate >= 0.03) {
            up3RateCount++;
            up3RateList.push((rate * 100).toFixed(2) + '%');
            up3DateList.push(date.substring(5));
        }
        if (rate <= -0.03) {
            down3RateCount++;
            down3RateList.push((rate * 100).toFixed(2) + '%');
            down3DateList.push(date.substring(5));
        }

        if (rate <= -0.02 && i + 1 < myKList.length) {
            let price3 = myKList[i + 1][2];
            let rate2 = (price3 - price2) / price2;
            rate2List.push({
                date,
                rate: (rate * 100).toFixed(2) + '%',
                rate22: (rate2 * 100).toFixed(2) + '%',
                rate2
            });
        }
    }
    console.log(`${startStr} ${endStr}`);
    console.log(`上涨天数`, upCount);
    console.log(`下跌天数`, downCount);

    console.log(`涨幅 >= 3% 的天数`, up3RateCount, up3DateList, up3RateList);
    console.log(`跌幅 >= 3% 的天数`, down3RateCount, down3DateList, down3RateList);
}


(async function(params) {
    await analyzePriceChange('sh000001', '2024-01-01', '2025-01-01', 366, data2024);
    await analyzePriceChange('sh000001', '2025-01-01', '2026-01-01', 366, data2025);
    await analyzePriceChange('sh000001', '2026-01-01', '2027-01-01', 366, data2026);

    let str = `|   日期  |  跌幅 | 下一交易日涨幅(%) | 下一交易日涨幅 |
| ---------- | --------- | --------- | --------- |\n`;
    for (let i = 0; i < rate2List.length; i++) {
        str = str + `| ${rate2List[i].date}  | ${rate2List[i].rate}   |  ${rate2List[i].rate22} | ${rate2List[i].rate2}   |\n`;
    }
    console.log('上证指数跌幅超过 2%');
    console.log(JSON.stringify(rate2List));
    console.log();
    console.log(str);
    console.log();
    console.log('done');
    console.log();
}());


console.log();