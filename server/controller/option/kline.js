import * as optionService from '../../service/option.js';

/**
 * 请求期权K线
 */
export async function queryKLineByDay(req, res) {
    let stockFullId = req.query.stockFullId;
    let startStr = req.query.start;
    let endStr = req.query.end;

    let myKList = await optionService.requestOptionDayK(stockFullId, startStr, endStr);

    res.json({
        code: 0,
        data: {
            list: myKList
        }
    });
}