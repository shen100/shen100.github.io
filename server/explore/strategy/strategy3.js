
export function detectDowntrend(allItems) {
    let rightIndex = -11;
    const items = allItems.slice(rightIndex);

    let trendChangePointIndex = -1;
    for (let i = -rightIndex; i >= 2; i--) {
        let maxPrice = 0;
        let maxPriceIndex = -1;
        let minPrice = 100000000;
        let minPriceIndex = -1;
        let index = items.length - i;
        for (let j = index + 1; j < items.length; j++) {
            if (items[j].closePrice > maxPrice) {
                maxPrice = items[j].closePrice;
                maxPriceIndex = j;
            }
            if (items[j].closePrice < minPrice) {
                minPrice = items[j].closePrice;
                minPriceIndex = j;
            }
        }
        let downRate = (items[index].closePrice - minPrice) / items[index].closePrice;

        if (!(items[index].closePrice > maxPrice && downRate > 0.15)) {
            return { ok: false };
        }
        trendChangePointIndex = allItems.length - items.length + index;
        break;
    }
    if (trendChangePointIndex >= allItems.length - 2) {
        return { ok: false };
    }
    for (let i = 0; i < trendChangePointIndex; i++) {
        if (allItems[i].highPrice > allItems[trendChangePointIndex].closePrice) {
            return { ok: false };
        }
    }
   return { ok: true, trendChangePointIndex };
}