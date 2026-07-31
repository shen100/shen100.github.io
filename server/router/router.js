import * as tushare from '../controller/tushare/tushare.js';
import * as shizhi_stat from '../controller/statistics/shizhi_stat.js';
import * as daily_stat from '../controller/statistics/daily_stat.js';
import * as concept_sector from '../controller/concept_sector/concept_sector.js';
import * as stock from '../controller/stock/stock.js';
import * as kline from '../controller/stock/kline.js';

export function init(app) {
    app.get('/api/tushare/all_daily_basic', tushare.queryAllDailyBasic);

    app.get('/api/statistics/shizhi', shizhi_stat.queryShiZhi);
    app.get('/api/statistics/daily/money_flow', daily_stat.queryDailyMoneyFlow);
    app.get('/api/statistics/daily/surge_plunge', daily_stat.queryDailySurgePlungeCount);
    app.get('/api/statistics/daily/up/:dayCount', daily_stat.queryDailyUpCount);
    app.get('/api/statistics/concept/get_stocks', concept_sector.queryStocksByConcept);

    app.get('/api/stocks/get_stocks_by_uuid/:uuid', stock.queryStocksByUUID);
    app.get('/api/stocks/kline/detail', kline.queryDetail);
    app.get('/api/stocks/kline/day', kline.queryDayKLine);
    app.get('/api/stocks/kline/minute', kline.queryMinuteKLine);
    app.post('/api/stocks/get_stocks_by_names', stock.queryStocksByNames);
    app.post('/api/stocks/get_stocks_by_fullids', stock.queryStocksByFullIds);
}