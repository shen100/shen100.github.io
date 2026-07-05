/**
 * 找出最新的收盘价是历史最高价的股票, 不考虑以下公司
 * 1. 上市时间少于 100 个交易日
 * 2. 公司市值小于 100 亿
 * 3. 在北交所上市
 */
export function detectTrend(allItems, stockDetail) {
    let index = allItems.length - 1;
    for (let i = 0; i < index; i++) {
        if (allItems[i].highPrice > allItems[index].closePrice) {
            return { ok: false };
        }
    }

    if (stockDetail.zongShiZhi < 100) {
        return { ok: false };
    }
    if (stockDetail.stockFullId.indexOf('bj') === 0) {
        return { ok: false };
    }
    return { ok: true };
}