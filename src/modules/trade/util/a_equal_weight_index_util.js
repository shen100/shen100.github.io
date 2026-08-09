import axios from 'axios';
import config from '../config/config';

export async function requestEqualWeightData(start, end) {
	const res = await axios({
		method: 'get',
		url: config.url + `/api/statistics/daily/a_equal_weight_index?start=${start}&end=${end}`
	});
	let resData = res.data.data;
    // console.log('requestEqualWeightData', resData);
    return resData.list; 
}