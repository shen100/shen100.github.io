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

    let right = 60;
    let highPrice = 0;
    let lowPrice = 10000 * 10000;

    for (let i = allItems.length - right; i < allItems.length; i++) {
        if (allItems[i].closePrice > highPrice) {
            highPrice = allItems[i].closePrice;
        }
        if (allItems[i].closePrice < lowPrice) {
            lowPrice = allItems[i].closePrice;
        }
    }

    for (let i = 0; i < allItems.length - right; i++) {
        // 区间震荡所在区间的最高价大于之前的历史最高价，或者跌幅在 5% 以内
        if (allItems[i].closePrice > highPrice) {
            let rate = (allItems[i].closePrice - highPrice) / allItems[i].closePrice;
            if (rate > 0.05) {
                return { ok: false };
            }
        }
    }

    let maxRate = (highPrice - lowPrice) / highPrice;
    if (maxRate < 0.2) {
        return { ok: false };
    }

    let highPriceShockCount = 0;
    let lowPriceShockCount = 0;
    let flag = '';
    let shockDates = [];
    let highPriceRate;
    let lowPriceRate;
    let oldHighPriceRate;
    let oldLowPriceRate;

    for (let i = allItems.length - right; i < allItems.length; i++) {
        let date = allItems[i].date;
        highPriceRate = Math.abs((allItems[i].closePrice - highPrice) / highPrice);
        lowPriceRate = Math.abs((allItems[i].closePrice - lowPrice) / lowPrice);
        if (highPriceRate < 0.04) {
            if (!flag || flag === 'low') {
                highPriceShockCount++;
                flag = 'high';
                shockDates.push({ priceExtreme: 'high', date });
                oldHighPriceRate = highPriceRate;
            } else if (flag === 'high' && highPriceRate < oldHighPriceRate) {
                shockDates.splice(shockDates.length - 1, 1);
                shockDates.push({ priceExtreme: 'high', date });
                oldHighPriceRate = highPriceRate;
            }
        }
        if (lowPriceRate < 0.04) {
            if (!flag || flag === 'high') {
                lowPriceShockCount++;
                flag = 'low';
                shockDates.push({ priceExtreme: 'low', date });
                oldLowPriceRate = lowPriceRate;
            } else if (flag === 'low' && lowPriceRate < oldLowPriceRate) {
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