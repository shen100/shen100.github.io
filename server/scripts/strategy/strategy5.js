import * as dateUtil from '../../util/date.js';

/**
 * 找出最近处于区间震荡的股票, 不考虑以下公司
 * 1. 上市时间少于 100 个交易日
 * 2. 公司市值小于 100 亿
 * 3. 在北交所上市
 */
export function detectTrend(allItems, stockDetail) {
    // 上市时间少于 100 个交易日的，不考虑
    if (allItems.length < 100) {
        return { ok: false };
    }

    if (stockDetail.zongShiZhi < 100) {
        return { ok: false };
    }
    if (stockDetail.stockFullId.indexOf('bj') === 0) {
        return { ok: false };
    }

    if (stockDetail.stockName === '中国宝安') {
        console.log();
    }

    let right = 60;
    let highPrice = 0;
    let highPriceDate = '';
    let lowPrice = 10000 * 10000;
    let lowPriceDate = '';

    for (let i = allItems.length - right; i < allItems.length; i++) {
        if (allItems[i].closePrice > highPrice) {
            highPrice = allItems[i].closePrice;
            highPriceDate = allItems[i].date;
        }
        if (allItems[i].closePrice < lowPrice) {
            lowPrice = allItems[i].closePrice;
            lowPriceDate = allItems[i].date;
        }
    }

    for (let i = 0; i < allItems.length - right; i++) {
        // 需要满足以下 2 种情况之一
        // 1. 区间震荡所在区间的最高价要大于之前的历史最高价
        // 2. 区间震荡所在区间的最高价和之前的历史最高价相比，跌幅要在 5% 以内
        if (allItems[i].closePrice > highPrice) {
            let rate = (allItems[i].closePrice - highPrice) / allItems[i].closePrice;
            if (rate > 0.05) {
                return { ok: false };
            }
        }
    }

    // if (lowPriceDate <= highPriceDate) {
    //     return { ok: false };
    // }

    let maxRate = (highPrice - lowPrice) / highPrice;
    if (maxRate < 0.2) {
        return { ok: false };
    }

    let highPriceShockCount = 0;
    let lowPriceShockCount = 0;
    let highPriceShockDate = '';
    let lowPriceShockDate = '';
    let flag = '';
    let shockDates = [];
    let highPriceRate;
    let lowPriceRate;
    let oldHighPriceRate;
    let oldLowPriceRate;

    for (let i = allItems.length - right; i < allItems.length; i++) {
        let date = allItems[i].date;
        // if (date < highPriceDate || date < lowPriceDate) {
        //     return { ok: false };
        // }
        highPriceRate = Math.abs((allItems[i].closePrice - highPrice) / highPrice);
        lowPriceRate = Math.abs((allItems[i].closePrice - lowPrice) / lowPrice);

        let highDayDiffPassed = dateUtil.getDayDiff(highPriceShockDate, date) >= 10;
        let lowDayDiffPassed = dateUtil.getDayDiff(lowPriceShockDate, date) >= 10;

        if (stockDetail.stockName === '杰瑞股份' && date === '2026-07-20') {
            console.log();
        }
        if (highPriceRate < 0.04) {
            if (!flag || flag === 'low') {
                highPriceShockDate = date;
                highPriceShockCount++;
                flag = 'high';
                shockDates.push({ priceExtreme: 'high', date });
                oldHighPriceRate = highPriceRate;
            } else if (flag === 'high' && highPriceRate < oldHighPriceRate) {
                highPriceShockDate = date;
                shockDates.splice(shockDates.length - 1, 1);
                shockDates.push({ priceExtreme: 'high', date });
                oldHighPriceRate = highPriceRate;
            }
        }
        if (lowPriceRate < 0.04) {
            if (!flag || flag === 'high') {
                lowPriceShockDate = date;
                lowPriceShockCount++;
                flag = 'low';
                shockDates.push({ priceExtreme: 'low', date });
                oldLowPriceRate = lowPriceRate;
            } else if (flag === 'low' && lowPriceRate < oldLowPriceRate) {
                lowPriceShockDate = date;
                shockDates.splice(shockDates.length - 1, 1);
                shockDates.push({ priceExtreme: 'low', date });
                oldLowPriceRate = lowPriceRate;
            }
        }
    }

    if (stockDetail.stockName === '杰瑞股份') {
        console.log(stockDetail.stockName, JSON.stringify(shockDates, null, 2));
    }

    if (highPriceShockCount < 1) {
        return { ok: false };
    }

    if (lowPriceShockCount < 1) {
        return { ok: false };
    }

    if (highPriceShockCount + lowPriceShockCount < 4) {
        return { ok: false };
    }

    shockDates = shockDates.map(data => data.date);
    return { ok: true, shockDates };
}