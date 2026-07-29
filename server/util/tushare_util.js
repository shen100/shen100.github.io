export function convertStockFullIdToTsCode(stockFullId) {
    const str1 = stockFullId.slice(0, 2);
    const str2 = stockFullId.slice(2);
    const tsCode = str2 + '.' + str1.toUpperCase();
    return tsCode;
}