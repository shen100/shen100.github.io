/**
 * 找出最近 N 天这个时间段的涨幅超过 50% 的股票, 不考虑以下公司
 * 1. 上市时间少于 100 个交易日
 * 2. 公司市值小于 100 亿
 */
export function detectTrend(allItems, stockDetail, options = {}) {
    // 上市时间少于 100 个交易日的，不考虑
    if (allItems.length < 100) {
        return { ok: false };
    }
    if (stockDetail.zongShiZhi < 100) {
        return { ok: false };
    }

    const rightIndex = options.rightIndex || -10;
    let items = allItems.slice(rightIndex);

    let highPrice = 0;
    let highPriceIndex = -1;
    let lowPrice = 10000 * 10000;
    let lowPriceIndex = -1;

    for (let i = 0; i < items.length; i++) {
        if (items[i].closePrice > highPrice) {
            highPrice = items[i].closePrice;
            highPriceIndex = i;
        }
        if (items[i].closePrice < lowPrice) {
            lowPrice = items[i].closePrice;
            lowPriceIndex = i;
        }
    }

    let rate = (highPrice - lowPrice) / lowPrice;
    if (highPriceIndex > lowPriceIndex && rate >= 0.5) {
        return { ok: true };
    }

    return { ok: false };
}