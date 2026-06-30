/**
 * 检测最新的收盘价是否是历史最高价(不包括市值小于 100 亿的公司)
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
    return { ok: true };
}