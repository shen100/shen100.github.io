import * as mongo from '../../database/mongo.js';
import { conceptSectors } from '../../data/concept_sector.js';

/**
 * 根据概念板块名来查询其包含的所有股票
 */
export async function queryStocksByConcept(req, res) {
    const concept = req.query.concept;
    let stockNames = [];
    for (let i = 0; i < conceptSectors.length; i++) {
        if (conceptSectors[i].name === concept) {
            stockNames = conceptSectors[i].stocks.slice(0);
            break;
        }
    }

    if (!stockNames.length) {
        res.json({
            code: 0,
            data: {
                stocks: [],
            }
        });
        return;
    }

    const projection = {
        stockId: 1,
        stockName: 1,
        stockFullId: 1,
        _id: 0 // 不返回 _id
    };

    const db = mongo.getDB();
    const collection = db.collection('stock_detail');
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