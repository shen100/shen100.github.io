import * as strategy4 from './strategy4.js';

/**
 * 找出最近20天的收盘价是历史最高价、公司市值小于 100 亿、最近若干天处于下跌趋势的股票
 */
export function detectTrend(allItems, stockDetail, options) {
    // 上市时间少于 100 个交易日的，不考虑
    if (allItems.length < 100) {
        return;
    }
    if (stockDetail.stockName === '合锻智能') {
        console.log();
    }
    let rightIndex = -20;
    if (!strategy4.detectTrend(allItems, stockDetail, { rightIndex } ).ok) {
        return { ok: false };
    }
    let items = allItems.slice(rightIndex);
    let maxPrice = 0;
    let maxPriceIndex = -1;
    for (let i = 0; i < items.length; i++) {
        if (items[i].closePrice > maxPrice) {
            maxPrice = items[i].closePrice;
            maxPriceIndex = i;
        }
    }

    let count = items.length - 1 - maxPriceIndex;
    if (count < 5) {
        return { ok: false };
    }

    let downPriceCount = 0;
    let downMinPrice = 100000000;
    for (let i = maxPriceIndex + 1; i < items.length; i++) {
        if (items[i - 1].closePrice > items[i].closePrice) {
            downPriceCount++;
        }
        if (items[i].closePrice < downMinPrice) {
            downMinPrice = items[i].closePrice;
        }
    }
    
    // if (downPriceCount / count < 0.1) { // 0.7
    //     return { ok: false };
    // }
    if ((maxPrice - downMinPrice) / maxPrice < 0.15) {
        return { ok: false };
    }
    return { ok: true };
}