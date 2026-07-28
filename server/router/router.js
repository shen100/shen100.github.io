import * as tushare from '../controller/tushare/tushare.js';
import * as shizhi_stat from '../controller/statistics/shizhi_stat.js';
import * as daily_stat from '../controller/statistics/daily_stat.js';
import * as concept_sector from '../controller/concept_sector/concept_sector.js';
import * as stock from '../controller/stock/stock.js';

export function init(app) {
    app.get('/api/tushare/all_daily_basic', tushare.queryAllDailyBasic);
    app.get('/api/statistics/shizhi', shizhi_stat.queryShiZhi);
    app.get('/api/statistics/daily/money_flow', daily_stat.queryDailyMoneyFlow);
    app.get('/api/statistics/daily/:direction', daily_stat.queryDailyUpCount);
    app.get('/api/statistics/concept/get_stocks', concept_sector.queryStocksByConcept);
    app.post('/api/stocks/get_stocks_by_names', stock.queryStocksByNames);
}