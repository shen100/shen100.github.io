import * as strategy4 from './strategy4.js';

/**
 * 找出最近 20 天（其中某一天）的收盘价是历史最高价、最近若干天处于下跌趋势的股票, 不考虑以下公司
 * 1. 上市时间少于 100 个交易日
 * 2. 公司市值小于 100 亿
 */
export function detectTrend(allItems, stockDetail, options) {
    if (stockDetail.stockName === '艾罗能源') {
        console.log();
    }

    // 上市时间少于 100 个交易日的，不考虑
    if (allItems.length < 100) {
        return { ok: false };
    }
    if (stockDetail.zongShiZhi < 100) {
        return { ok: false };
    }
    let rightIndex = -20;
    if (!strategy4.detectTrend(allItems, stockDetail, { rightIndex } ).ok) {
        return { ok: false };
    }
    let items = allItems.slice(rightIndex);
    let highPrice = 0;
    let highPriceIndex = -1;
    for (let i = 0; i < items.length; i++) {
        if (items[i].closePrice > highPrice) {
            highPrice = items[i].closePrice;
            highPriceIndex = i;
        }
    }

    // highPriceIndex 后面还有几根 K 线
    let count = items.length - 1 - highPriceIndex;
    if (count < 5) {
        return { ok: false };
    }

    // highPriceIndex 后面有几个阴线
    let downPriceCount = 0;
    let downLowPrice = 100000000;
    for (let i = highPriceIndex + 1; i < items.length; i++) {
        if (items[i].closePrice < items[i - 1].closePrice) {
            downPriceCount++;
        }
        if (items[i].closePrice < downLowPrice) {
            downLowPrice = items[i].closePrice;
        }
    }
    
    // if (downPriceCount / count < 0.1) { // 0.7
    //     return { ok: false };
    // }
    if ((highPrice - downLowPrice) / highPrice < 0.15) {
        return { ok: false };
    }
    return { ok: true };
}