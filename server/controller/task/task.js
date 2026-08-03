import crypto from 'node:crypto';
import * as socket_client_logger from '../../util/socket_client_logger.js';

import * as mongo from '../../database/mongo.js';
import { conceptSectors } from '../../data/concept_sector.js';
import config from '../../config/config.js';
import * as save_kline_day_to_db from '../../scripts/sync_data/save_kline_day_to_db.js';
import * as save_stock_detail_to_db from '../../scripts/sync_data/save_stock_detail_to_db.js';
import * as save_tushare_daily_basic_to_db from '../../scripts/sync_data/save_tushare_daily_basic_to_db.js';
import * as stat_money_flow from '../../scripts/statistics/stat_money_flow.js';
import * as stat_daily_surge_plunge_count from '../../scripts/statistics/stat_daily_surge_plunge_count.js';
import * as stat_daily_up_count from '../../scripts/statistics/stat_daily_up_count.js';

export async function exec(req, res) {
    let task = req.body.task;
    let socketId = req.body.socketId;
    let socketClientLogger = socket_client_logger.getLogger(socketId);

    if (task === 'save_kline_day_to_db') {
        await save_kline_day_to_db.exec({ logger: socketClientLogger });
    } else if (task === 'save_stock_detail_to_db') {
        await save_stock_detail_to_db.exec({ logger: socketClientLogger });
    } else if (task === 'save_tushare_daily_basic_to_db') {
        await save_tushare_daily_basic_to_db.exec({ logger: socketClientLogger });
    } else if (task === 'stat_money_flow') {
        await stat_money_flow.exec({ logger: socketClientLogger });
    } else if (task === 'stat_daily_surge_plunge_count') {
        await stat_daily_surge_plunge_count.exec({ logger: socketClientLogger });
    } else if (task === 'stat_daily_up_count') {
        await stat_daily_up_count.exec({ logger: socketClientLogger });
    }

    res.json({
        code: 0,
        data: {
        }
    });
}

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