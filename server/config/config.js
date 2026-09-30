export default {
    uuidDataExpiredTime: 24 * 3600 * 1000,
    taskExecHistoryExpiredTime: 7 * 24 * 3600 * 1000,
    socks5ProxyUrl: 'socks5://127.0.0.1:1086',
    url: 'http://127.0.0.1:3000', // server api url
    sinaRealTimeOptionQuoteUrl: 'https://hq.sinajs.cn/?_={random}&list=CON_OP_{contractId},CON_OP_{contractId}_i',
    sinaOptionDayUrl: 'https://stock.finance.sina.com.cn/futures/api/jsonp_v2.php/var%20_CON_OP_{stockFullId}=/StockOptionDaylineService.getSymbolInfo?symbol=CON_OP_{contractId}',
    sinaOptionMinuteUrl: 'https://stock.finance.sina.com.cn/futures/api/openapi.php/StockOptionDaylineService.getOptionMinline?symbol=CON_OP_{contractId}&random={random}&callback=var%20t1CON_OP_{contractId}='
}






