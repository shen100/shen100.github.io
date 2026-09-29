import * as optionService from '../../service/option.js';
import { formatLocalYMD } from '../../util/date.js';

/**
 * 请求期权分时
 */
export async function queryKLineByMinute(req, res) {
    let stockFullId = req.query.stockFullId;

    let result = await optionService.requestOptionMinuteK(stockFullId);

    res.json({
        code: 0,
        data: {
            [stockFullId]: {
                data: {
                    data: result.myKList,
                    date: formatLocalYMD(new Date()).replaceAll('-', '')
                },
                qt: {
                    [stockFullId]: result.stockInfo
                }
            }
        }
    });
}

/**
 * 请求期权日K线
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