import * as tushare from '../controller/tushare/tushare.js';

export function init(app) {
    app.get('/api/tushare/all_daily_basic', tushare.queryAllDailyBasic);
}