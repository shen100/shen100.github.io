import * as tushare from '../controller/tushare/tushare.js';
import * as shizhi_stat from '../controller/statistics/shizhi_stat.js';
import * as daily_stat from '../controller/statistics/daily_stat.js';
import * as stock_daily_amount from '../controller/statistics/stock_daily_amount.js';
import * as stat_index from '../controller/statistics/stat_index.js';

import * as stock from '../controller/stock/stock.js';
import * as setting from '../controller/stock/setting.js';
import * as kline from '../controller/stock/kline.js';
import * as task from '../controller/task/task.js';
import * as todo_list from '../controller/task/todo_list.js';

export function init(app) {
    app.get('/api/tushare/all_daily_basic', tushare.queryAllDailyBasic);

    // 查询统计相关的 API
    app.get('/api/statistics/shizhi', shizhi_stat.queryShiZhi);
    app.get('/api/statistics/daily/money_flow', daily_stat.queryDailyMoneyFlow);
    app.get('/api/statistics/daily/surge_plunge', daily_stat.queryDailySurgePlungeCount);
    app.get('/api/statistics/daily/adline', daily_stat.queryDailyAdLine);
    app.get('/api/statistics/daily/amount', stock_daily_amount.queryStockDailyAmount);
    app.get('/api/statistics/daily/a_equal_weight_index', stat_index.queryEqualWeightIndex);


    app.get('/api/statistics/daily/up/:dayCount', daily_stat.queryDailyUpCount);
    app.post('/api/statistics/daily/amount', stock_daily_amount.saveStockDailyAmount);

    // 股票相关的 API
    app.get('/api/stocks/kline/minute', kline.requestMinuteK);
    app.get('/api/stocks/kline/:interval', kline.queryKLineByInterval);
    app.get('/api/stocks/get_stocks_by_uuid/:uuid', stock.queryStocksByUUID);
    app.get('/api/stocks/detail', stock.queryDetail);
    app.get('/api/stocks/setting', setting.querySetting);
    app.post('/api/stocks/get_stocks_by_names', stock.queryStocksByNames);
    app.post('/api/stocks/get_stocks_by_fullids', stock.queryStocksByFullIds);
    app.post('/api/stocks/setting', setting.saveSetting);

    // 定时/手动任务相关的 API
    app.get('/api/tasks/last_history', task.queryLastHistory);
    app.post('/api/tasks/exec', task.exec);

    // 待办事项相关的 API
    app.get('/api/todo/today', todo_list.today);
    app.get('/api/todo/get_daily_todo_count', todo_list.getDailyFinishedTaskCount);
    app.post('/api/todo/done', todo_list.done);
}