/**
 * 找出最近 30 天（其中某一天）的收盘价是历史最高价
 */
export function detectTrend(allItems, stockDetail, options) {
    if (stockDetail.stockName === '鹏鼎控股') {
        console.log();
    }

    options = options || { rightIndex: -20 };
    if (options && options.checkShiZhi && stockDetail.zongShiZhi < 100) {
        return { ok: false };
    }

    let rightIndex = options.rightIndex;
    let items = allItems.slice(rightIndex);

    let highPrice = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].closePrice > highPrice) {
            highPrice = items[i].closePrice;
        }
    }

    let items2 = allItems.slice(0, allItems.length + rightIndex);
    for (let i = 0; i < items2.length; i++) {
        if (items2[i].highPrice > highPrice) {
            return { ok: false };
        }
    }
    if (stockDetail.stockName === '艾罗能源') {
        console.log();
    }
    return { ok: true };
}