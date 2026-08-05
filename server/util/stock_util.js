export function isSTStock(stockName) {
    // 'ST', '*ST', 'SST', 'S*ST'
    let str = stockName.substring(0, 2);
    if (str === 'ST') {
        return true;
    }
    str = stockName.substring(0, 3);
    if (str === '*ST') {
        return true;
    }
    if (str === 'SST') {
        return true;
    }
    str = stockName.substring(0, 4);
    if (str === 'S*ST') {
        return true;
    }
    return false;
}