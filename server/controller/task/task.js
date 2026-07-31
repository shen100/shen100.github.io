import crypto from 'node:crypto';
import * as socket_client_logger from '../../util/socket_client_logger.js';

import * as mongo from '../../database/mongo.js';
import { conceptSectors } from '../../data/concept_sector.js';
import config from '../../config/config.js';
import * as save_kline_day_to_db from '../../scripts/sync_data/save_kline_day_to_db.js';
import * as save_stock_detail_to_db from '../../scripts/sync_data/save_stock_detail_to_db.js';

export async function exec(req, res) {
    let task = req.body.task;
    let socketId = req.body.socketId;
    let socketClientLogger = socket_client_logger.getLogger(socketId);

    if (task === 'save_kline_day_to_db.js') {
        await save_kline_day_to_db.exec({ logger: socketClientLogger });
    } else if (task === 'save_stock_detail_to_db.js') {
        await save_stock_detail_to_db.exec({ logger: socketClientLogger });
    }

    res.json({
        code: 0,
        data: {
        }
    });
}