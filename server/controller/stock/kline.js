import stockUtil from '../../util/stock_util.js'

export async function queryDayKLine(req, res) {
    let stockFullId = req.query.stockFullId;
    let startStr = req.query.start;
    let endStr = req.query.end;
    let countStr = req.query.count;
    let useYahooApi = [ '^KS11' ].indexOf(stockFullId) >= 0;
    let myKList;
    if (useYahooApi) {
        myKList = await stockUtil.requestYahooDayK(stockFullId, startStr, endStr);
    } else {
        myKList = await stockUtil.requestDayK(stockFullId, startStr, endStr, countStr);
    }
    res.json({
        code: 0,
        data: {
            kList: myKList,
        }
    });
}

export async function queryMinuteKLine(req, res) {
    let stockFullId = req.query.stockFullId;
    let useYahooApi = [ '^KS11' ].indexOf(stockFullId) >= 0;
    let resData;
    if (useYahooApi) {
        resData = await stockUtil.requestYahooMinuteK(stockFullId);
    } else {
        
    }
    res.json({
        code: 0,
        data: resData
    });
}

export async function queryDetail(req, res) {
    let stockFullId = req.query.stockFullId;
    let useYahooApi = [ '^KS11' ].indexOf(stockFullId) >= 0;
    let detailData;
    if (useYahooApi) {
        detailData = await stockUtil.requestYahooStockDetail(stockFullId);
    } else {
        
    }
    res.json({
        code: 0,
        data: detailData
    });
}