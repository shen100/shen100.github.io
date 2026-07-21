import { requestDayK } from '../stockUtil.js';
import { data2024 } from './data/shang_zheng/2024.js';
import { data2025 } from './data/shang_zheng/2025.js';
import { data2026 } from './data/shang_zheng/2026.js';

// https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=sh000001,day,2025-01-01,2026-01-01,400,qfq

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

    let up2RateCount = 0;
    let down2RateCount = 0;
    let up2RateList = [];
    let down2RateList = [];
    let up2DateList = [];
    let down2DateList = [];

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

        if (rate >= 0.02 && rate < 0.03) {
            up2RateCount++;
            up2RateList.push((rate * 100).toFixed(2) + '%');
            up2DateList.push(date.substring(5));
        }
        if (rate <= -0.02 && rate > -0.03) {
            down2RateCount++;
            down2RateList.push((rate * 100).toFixed(2) + '%');
            down2DateList.push(date.substring(5));
        }
    }
    console.log(`${startStr} ${endStr}`);
    console.log(`上涨天数`, upCount);
    console.log(`下跌天数`, downCount);
    console.log(`涨幅 >= 2% and < %3 的天数`, up2RateCount, up2DateList, up2RateList);
    console.log(`跌幅 >= 2% and < 3% 的天数`, down2RateCount, down2DateList, down2RateList);

    console.log(`涨幅 >= 3% 的天数`, up3RateCount, up3DateList, up3RateList);
    console.log(`跌幅 >= 3% 的天数`, down3RateCount, down3DateList, down3RateList);
    console.log();
}


(async function(params) {
    await analyzePriceChange('sh000001', '2024-01-01', '2025-01-01', 366, data2024);
    await analyzePriceChange('sh000001', '2025-01-01', '2026-01-01', 366, data2025);
    await analyzePriceChange('sh000001', '2026-01-01', '2027-01-01', 366, data2026);
}());


console.log();