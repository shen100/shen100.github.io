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