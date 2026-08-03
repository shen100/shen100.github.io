import YahooFinance from 'yahoo-finance2';
import { Socks5ProxyAgent } from 'undici'
import config from '../../config/config.js';
import { requestYahooDayK } from '../../util/stock_util.js'

const yahooFinance = new YahooFinance();
const dispatcher = new Socks5ProxyAgent(config.socks5ProxyUrl);

export async function queryDayKLine(req, res) {
    let stockId = req.query.stockId;
    let startStr = req.query.startStr;
    let endStr = req.query.endStr;

    await requestYahooDayK(stockId, startStr, endStr);
}

export async function queryMinuteKLine(req, res) {
    const start = new Date(Date.now() - 3 * 24 * 3600 * 1000);
    const end = new Date();

    const result = await yahooFinance.chart(
        '^KS11',
        {
        period1: start.getTime() / 1000,
        period2: end.getTime() / 1000,
        interval: interval,
        includePrePost: false, // 关闭盘前盘后，只保留交易所正式交易
        },
        {
        fetchOptions: {
            dispatcher,
            signal: AbortSignal.timeout(15000)
        }
        }
    );

    // 解析chart返回的K线数组
    const quotes = result.quotes || [];
    const klineList = quotes
        .filter(item => item.open !== undefined) // 过滤残缺空数据
        .map(item => ({
        timestamp: item.date * 1000,
        dateUtc: new Date(item.date * 1000).toISOString(),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume || 0
        }));

    console.log(`分时${interval} 获取条数：`, klineList.length);
    return klineList;
}

loadKospiDaily().catch(err => {
    console.error('拉取KOSPI失败：', err);
});