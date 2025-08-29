const fs = require('fs');
const path = require('path');
const axios = require('axios');

function formatLocalYMD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

function sleep(timeout) {
	return new Promise(resolve => setTimeout(resolve, timeout));
}

async function requestCompany(tradeDate) {
    await sleep(31 * 1000); // 避免请求过快
    const reqData = {
		method: 'post',
		url: 'http://api.tushare.pro',
		headers: {
			'content-type': 'application/json',
		},
		data: {
			token: process.env.TU_SHARE_TOKEN,
			api_name: 'bak_basic',
			params: {
				trade_date: tradeDate,
			}
		}
	};
	const res = await axios(reqData);
	if (!(res.data.code === 0 && res.data.data && res.data.data.items && res.data.data.items.length)) {
		return null;
	}
	let data = res.data.data;
    console.log(data);
    return data;
}

async function checkOrFetchCompanyData(tradeDate) {
    console.log(`Checking data for ${tradeDate}`);
    const dataDir = path.join(__dirname, 'data');
    const filePath = path.join(dataDir, `${tradeDate}.json`);

    if (fs.existsSync(filePath)) {
        return;
    } else {
        const data = await requestCompany(tradeDate);
        if (data) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        }
        return data;
    }
}

(async function() {
    let tradeDate = new Date(2000, 0, 1); // 1990年12月19日
    for (let i = 0; true; i++) {
        await checkOrFetchCompanyData(formatLocalYMD(tradeDate).replace(/-/g, ''));
        tradeDate = new Date(tradeDate.getTime() + 24 * 3600 * 1000);
    }
}());