/**
 * 检测最近20天的收盘价是否是历史最高价(不包括市值小于 100 亿的公司)
 */
export function detectTrend(allItems, stockDetail, options) {
    options = options || { rightIndex: -20 };
    if (stockDetail.stockName === '绿的谐波') {
        console.log('debug');
    }

    let rightIndex = options.rightIndex;
    let items = allItems.slice(rightIndex);

    let maxPrice = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].closePrice > maxPrice) {
            maxPrice = items[i].closePrice;
            console.log(JSON.stringify(items[i]));
        }
    }

    let items2 = allItems.slice(0, allItems.length + rightIndex);
    for (let i = 0; i < items2.length; i++) {
        if (items2[i].highPrice > maxPrice) {
            return { ok: false };
        }
    }

    if (stockDetail.zongShiZhi < 100) {
        return { ok: false };
    }
    return { ok: true };
}