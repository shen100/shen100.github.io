import * as socket_client_logger from '../../util/socket_client_logger.js';
import * as mongo from '../../database/mongo.js';
import * as save_kline_day_to_db from '../../scripts/sync_data/save_kline_day_to_db.js';
import * as save_stock_detail_to_db from '../../scripts/sync_data/save_stock_detail_to_db.js';
import * as save_tushare_daily_basic_to_db from '../../scripts/sync_data/save_tushare_daily_basic_to_db.js';
import * as stat_money_flow from '../../scripts/statistics/stat_money_flow.js';
import * as stat_daily_surge_plunge_count from '../../scripts/statistics/stat_daily_surge_plunge_count.js';
import * as stat_daily_up_count from '../../scripts/statistics/stat_daily_up_count.js';
import * as a_equal_weight_index from '../../scripts/statistics/a_equal_weight_index.js';

/**
 * 执行任务
 */
export async function exec(req, res) {
    let task = req.body.task;
    let socketId = req.body.socketId;
    let socketClientLogger = socket_client_logger.getLogger(socketId);
    let resData;

    if (task === 'save_kline_day_to_db') {
        resData = await save_kline_day_to_db.exec({ logger: socketClientLogger });
    } else if (task === 'save_stock_detail_to_db') {
        resData = await save_stock_detail_to_db.exec({ logger: socketClientLogger });
    } else if (task === 'save_tushare_daily_basic_to_db') {
        resData = await save_tushare_daily_basic_to_db.exec({ logger: socketClientLogger });
    } else if (task === 'stat_money_flow') {
        resData = await stat_money_flow.exec({ logger: socketClientLogger });
    } else if (task === 'stat_daily_surge_plunge_count') {
        resData = await stat_daily_surge_plunge_count.exec({ logger: socketClientLogger });
    } else if (task === 'stat_daily_up_count') {
        resData = await stat_daily_up_count.exec({ logger: socketClientLogger });
    } else if (task === 'a_equal_weight_index') {
        resData = await a_equal_weight_index.exec({ logger: socketClientLogger });
    }

    res.json({
        code: 0,
        data: resData
    });
}

/**
 * 查询指定任务的最后一次执行历史
 */
export async function queryLastHistory(req, res) {
    const task = req.query.task;
    const db = await mongo.getDB();
    const collection = db.collection('task_exec_history');
    const taskExecHistory = await collection.find({
        taskName: task
    }).sort({ createdAt: -1 }).limit(1).toArray();
    let resData = null;
    if (taskExecHistory && taskExecHistory.length) {
        resData = taskExecHistory[0];
    }

    res.json({
        code: 0,
        data: resData
    });
}