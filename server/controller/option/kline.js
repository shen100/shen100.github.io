import * as optionService from '../../service/option.js'

/**
 * 请求股票K线
 */
export async function queryKLineByDay(req, res) {
    let stockFullId = req.query.stockFullId;
    let startStr = req.query.start;
    let endStr = req.query.end;

    let myKList = await optionService.requestOptionDayK(stockFullId, startStr, endStr);

    myKList.filter(item => {
        
    });

    res.json({
        code: 0,
        data: {
            // [stockFullId]: {
            //     day: myKList
            // },
            list: myKList
        }
    });
}