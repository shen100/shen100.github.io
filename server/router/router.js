import * as tushare from '../controller/tushare/tushare.js';
import * as shizhi_stat from '../controller/statistics/shizhi_stat.js';

export function init(app) {
    app.get('/api/tushare/all_daily_basic', tushare.queryAllDailyBasic);
    app.get('/api/statistics/shizhi', shizhi_stat.queryShiZhi);
}