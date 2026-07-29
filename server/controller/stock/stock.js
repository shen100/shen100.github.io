import crypto from 'node:crypto';
import * as mongo from '../../database/mongo.js';

export async function queryStocksByNames(req, res) {
    // res.json({
    //     code: 0,
    //     data: {
    //         stocks: [],
    //     }
    // });
    // return;

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
        stocks
    });

    res.json({
        code: 0,
        data: {
            uuid,
            stocks,
        }
    });
}

export async function queryStocksByUUID(req, res) {
    const uuid = req.params.uuid;
    const db = await mongo.getDB();
    const collection = db.collection('uuid_data');
    const uuidData = await collection.findOne({ uuid });

    res.json({
        code: 0,
        data: {
            stocks: uuidData.stocks
        }
    });
}