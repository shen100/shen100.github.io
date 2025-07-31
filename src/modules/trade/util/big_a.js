export function addStockExchangePrefix(stockCode) {
    const code = ('' + stockCode).trim();
    // 根据代码前缀判断交易所
    if (code.startsWith('600') || 
        code.startsWith('601') || 
        code.startsWith('603') || 
        code.startsWith('605') || 
        code.startsWith('688') || 
        code.startsWith('689')) {  // 上交所
        return `sh${code}`;
    } else if (code.startsWith('000') || 
        code.startsWith('001') || 
        code.startsWith('002') || 
        code.startsWith('003') || 
        code.startsWith('300') || 
        code.startsWith('301')) {  // 深交所
        return `sz${code}`;
    } else if (code.startsWith('8') || 
        code.startsWith('43') || 
        code.startsWith('83') || 
        code.startsWith('87') || 
        code.startsWith('88')) {  // 北交所
        return `bj${code}`;
    }

    // 未知交易所的代码
    throw new Error(`无法识别的股票代码: ${code}`);
}