import crypto from 'node:crypto';
import * as mongo from '../../database/mongo.js';
import config from '../../config/config.js';
import stockNetUtil from '../../util/stock_net_util.js'

/**
 * 根据一组股票名称查询股票信息
 */
export async function queryStocksByNames(req, res) {
    const stockNames = req.body.stockNames;
    const db = await mongo.getDB();
    const collection = db.collection('stock_detail');
    const projection = {
        stockId: 1,
        stockName: 1,
        stockFullId: 1,
        _id: 0 // 不返回 _id
    };
    const list = await collection.find({
        stockName: { $in: stockNames }
    }, { projection }).toArray();

    res.json({
        code: 0,
        data: {
            stocks: list,
        }
    });
}

/**
 * 根据一组 stockFullId 查询股票信息
 */
export async function queryStocksByFullIds(req, res) {
    const stockFullIds = req.body.stockFullIds;
    const db = await mongo.getDB();
    const collection = db.collection('stock_detail');
    const projection = {
        stockId: 1,
        stockName: 1,
        stockFullId: 1,
        _id: 0 // 不返回 _id
    };
    const stocks = await collection.find({
        stockFullId: { $in: stockFullIds }
    }, { projection }).toArray();

    const uuid = crypto.randomUUID();
    const uuidDataCol = db.collection('uuid_data');
    await uuidDataCol.insertOne({
        uuid,
        stocks,
        expiredAt: new Date(Date.now() + config.uuidDataExpiredTime)
    });

    res.json({
        code: 0,
        data: {
            uuid,
            stocks,
        }
    });
}

/**
 * 根据 uuid 查询对应的数据
 */
export async function queryStocksByUUID(req, res) {
    const uuid = req.params.uuid;
    const db = await mongo.getDB();
    const collection = db.collection('uuid_data');
    const projection = {
        _id: 0 // 不返回 _id
    };
    const uuidData = await collection.findOne({ uuid }, { projection });

    res.json({
        code: 0,
        data: uuidData
    });
}

/**
 * 查询股票详情
 */
export async function queryDetail(req, res) {
    let stockFullId = req.query.stockFullId;

    const db = await mongo.getDB();
    const collection = db.collection('stock_detail');

    const stock = await collection.findOne({ stockFullId });

    let detailData = await stockNetUtil.requestStockDetail(stock);
    res.json({
        code: 0,
        data: detailData
    });
}


/**
 * 查询给定日期，市值在某个范围内的所有股票
 */
export async function queryStocksByMarketValue(req, res) {
    let date = (req.query.date + '').replaceAll('-', '');
    let minMarketValue = parseInt(req.query.minMarketValue) || 0;
    let maxMarketValue = parseInt(req.query.maxMarketValue) || 0;

    const db = await mongo.getDB();
    const coll = db.collection('tushare_daily_basic');
    const filter = {
        items: {
            $elemMatch: {
                trade_date: date,
                total_mv: {
                    $gte: minMarketValue,
                    $lte: maxMarketValue
                }
            }
        }
    };

    const list = await coll.find(filter, { projection: { stockFullId: 1, _id: 0 } }).toArray();
    res.json({
        code: 0,
        data: {
            list
        }
    });
}