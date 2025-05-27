<template>
    <div class="kchart-container">
		<div class="stock-name">{{ data.stockName }}</div>
        <div v-if="data.dataLoaded" class="candle-container">
			<Candle
				v-for="(item, i) in data.myKList" :key="i"
				:candleType="data.type"
				:date="item[0]"
				:openPrice="item[1]"
				:closePrice="item[2]"
				:highPrice="item[3]"
				:lowPrice="item[4]"
				:volume="item[5]"
				:lowPriceInAll="data.lowPriceInAll"
				:highPriceInAll="data.highPriceInAll"
				:maxCandleHeight="data.maxHeight"
				:lowVolumeInAll="data.lowVolumeInAll"
				:highVolumeInAll="data.highVolumeInAll"
				:maxVolumeHeight="data.maxVolumeHeight"
			/>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findFromRight } from '../../util/str';
import Candle from '../components/candle.vue';

const route = useRoute()
const router = useRouter()

let data = ref({
	dataLoaded: false,
	type: 'day',
	stockName: '',
    lowPriceInAll: 0,
	highPriceInAll: 0,
	lowVolumeInAll: 0,
	highVolumeInAll: 0,
    maxHeight: 300,
    maxVolumeHeight: 170,
    end: '',
    myKList: [],
    candles: [],
    volumes: [],
    yAxisText1: '',
    yAxisText2: '',
    yAxisText3: '',
    yAxisText4: '',
    yAxisText5: '',
})

onMounted(async () => {

});

async function requestDayK(stock, start, end, count) {
	data.value.dataLoaded = false;
	data.value.stockName = stock.stockName;
    data.value.end = end;
    var url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
	url += (stock.stockFullId + ",day," + start + "," + end + "," + count + ",qfq");
    let res = await axios.get(url);
	
	/*
    [
		"2021-03-10", 0-交易日
		"1977.000", 1-开盘价
		"1970.010", 2-收盘价
		"1999.870", 3-最高价
		"1967.000", 4-最低价
		"51172.000" 5-总手
	]
    */
	if (!(res.data && res.data.data)) {
		return;
    }
	let myKList = [];
	if (res.data.data[stock.stockFullId]['qfqday']) {
		myKList = res.data.data[stock.stockFullId].qfqday;
    } else {
		myKList = res.data.data[stock.stockFullId].day;
    }
	updateMyKList(myKList);
	requestToday(stock.stockFullId)
}

async function requestToday(stockFullId) {
	var url = "https://qt.gtimg.cn/q=" + stockFullId;

	let res = await axios.get(url, {
        responseType: 'arraybuffer' 
    });
    if (!res.data) {
		return;
    }

    let gbkData = res.data;
    const decoder = new TextDecoder('gbk');
    const utf8String = decoder.decode(gbkData);
    const jsonStr = utf8String;
	if (!jsonStr) {
        return;
    }
	var todayStr = ""
	var index =  jsonStr.indexOf('"');
	if (index > 0) {
		todayStr = jsonStr.substr(index + 1);
    }
	index = findFromRight(todayStr, '"');
	if (index > 0) {
		todayStr = todayStr.substr(0, index)
    }

	var todayData = todayStr.split('~');
	const kData = [
		data.value.end,
		todayData[5],  // 开盘价
		todayData[3],  // 收盘价
		todayData[33], // 最高价
		todayData[34], // 最低价
		todayData[6],  // 总手
	];
	updateMyKList([ ...data.value.myKList, kData ]);
	updateChart("day");
}

async function requestWeekK(stock, start, end, count) {
	data.value.dataLoaded = false;
	data.value.stockName = stock.stockName;
	var url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
	url += (stock.stockFullId + ",week," + start + "," + end + "," + count + ",qfq");
	let res = await axios.get(url);
	
	if (!(res.data && res.data.data)) {
		return;
    }
		
	let myKList = [];
    if (res.data.data[stock.stockFullId]['qfqweek']) {
		myKList = res.data.data[stock.stockFullId].qfqweek;
    } else {
		myKList = res.data.data[stock.stockFullId].week;
    }
		
	let dates = []
	for (let i = 0; i < myKList.length; i++) {
		dates.push(myKList[i][0]); // 之前请求成交量用了dates
    }
	updateMyKList(myKList);
	updateChart("week")
}

async function requestMonthK(stock, start, end, count) {
	data.value.dataLoaded = false;
	data.value.stockName = stock.stockName;
	var url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=";
	url += (stock.stockFullId + ",month," + start + "," + end + "," + count + ",qfq");

	let res = await axios.get(url);
	
	if (!(res.data && res.data.data)) {
		return;
    }
		
	let myKList = [];
    if (res.data.data[stock.stockFullId]['qfqmonth']) {
		myKList = res.data.data[stock.stockFullId].qfqmonth;
    } else {
		myKList = res.data.data[stock.stockFullId].month;
    }
		
	let dates = []
	for (let i = 0; i < myKList.length; i++) {
		dates.push(myKList[i][0]); // 之前请求成交量用了dates
    }
	updateMyKList(myKList);
	updateChart("month")
}

async function requestYearK(stock, start, end, count) {
	data.value.dataLoaded = false;
	data.value.stockName = stock.stockName;
	var url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
	url += (stock.stockFullId + ",month," + start + "," + end + "," + count + ",qfq");

	let res = await axios.get(url);
	
	if (!(res.data && res.data.data)) {
		return;
    }
		
    let monthData;
    if (res.data.data[stock.stockFullId]['qfqmonth']) {
		monthData = res.data.data[stock.stockFullId].qfqmonth;
    } else {
		monthData = res.data.data[stock.stockFullId].month;
    }
		
	let yearMap = {};
	let curYear;
	let maxPrice = -100000000;
	let minPrice = 1000000000;

    for (let i = 0; i < monthData.length; i++) {
		let arr = monthData[i];
		let year = arr[0].substr(0, 4);
		if (!yearMap[year]) {
			yearMap[year] = [
				arr[0],
				arr[1], // 1-开盘价
				0, // 2-收盘价
				0, // 3-最高价
				0, // 4-最低价
				0, // 5-总手
			]
			curYear = year;
			maxPrice = Number(arr[3])
			minPrice = Number(arr[4])
        }
		let theMaxPrice = Number(arr[3]);
		let theMinPrice = Number(arr[4]);
		if (theMaxPrice > maxPrice) {
			maxPrice = theMaxPrice;
        }

		if (theMinPrice < minPrice) {
			minPrice = theMinPrice;
        }

		yearMap[curYear][5] += Number(arr[5]);

		if (i + 1 < monthData.length) {
			let nextYear = monthData[i + 1][0].substr(0, 4)
			if (curYear != nextYear) {
				yearMap[curYear][2] = arr[2]
				yearMap[curYear][3] = '' + maxPrice;
				yearMap[curYear][4] = '' + minPrice;
				// 以每年的最后一个交易日作为这年的日期
				yearMap[curYear][0] = arr[0];
            }
        } else {
			yearMap[curYear][2] = arr[2];
			yearMap[curYear][3] = '' + maxPrice;
			yearMap[curYear][4] = '' + minPrice;
			// 以每年的最后一个交易日作为这年的日期
			yearMap[curYear][0] = arr[0];
        }
    }

	let yearList = [];
	let yearTmpList = [];
	for (let key in yearMap) {
		yearTmpList.push({
			"year": key,
			"data": yearMap[key]
		});
    }

	yearTmpList.sort((a, b) => a.year > b.year ? -1 : 1);
	
    for (let i = 0; i < yearTmpList.length; i++) {
		yearTmpList[i].data[5] = '' + yearTmpList[i].data[5];
		yearList.push(yearTmpList[i].data);
    }

	let myKList = yearList;
	
	var dates = [];
    for (let i = 0; i < myKList.length; i++) {
		dates.push(myKList[i][0]); // 之前请求成交量用了dates
    }
	updateMyKList(myKList);
	updateChart("year")
}

function updateMyKList(myKList) {
	for (let i = 0; i < myKList.length; i++) {
		myKList[i][1] = Number(myKList[i][1]);
		myKList[i][2] = Number(myKList[i][2]);
		myKList[i][3] = Number(myKList[i][3]);
		myKList[i][4] = Number(myKList[i][4]);
		myKList[i][5] = Number(myKList[i][5]);
	}
	data.value.myKList = myKList;
}

function updateChart(candleType) {
	let lowPriceInAll = 10000000
	let highPriceInAll = -10000000
	let lowVolumeInAll = 10000000
	let highVolumeInAll = -10000000

	data.value.candles = [];
    data.value.volumes = [];
    data.value.candleType = candleType;

	const myKList = data.value.myKList;

    for (let i = 0; i < myKList.length; i++) {
		var highPrice = myKList[i][3];
		var lowPrice = myKList[i][4];
		var vol = Number(myKList[i][5])
		if (lowPrice < lowPriceInAll) {
			lowPriceInAll = lowPrice
        }
		if (highPrice > highPriceInAll) {
			highPriceInAll = highPrice
        }
		if (vol > highVolumeInAll) {
			highVolumeInAll = vol
        }
		if (vol < lowVolumeInAll) {
			lowVolumeInAll = vol
        }
    }

	data.value.lowPriceInAll = lowPriceInAll;
	data.value.highPriceInAll = highPriceInAll;
	
	var incAxis = (highPriceInAll - lowPriceInAll) / 4
	data.value.yAxisText1 = highPriceInAll.toFixed(2);
	data.value.yAxisText2 = (highPriceInAll - incAxis).toFixed(2);
	data.value.yAxisText3 = (highPriceInAll - 2 * incAxis).toFixed(2);
	data.value.yAxisText4 = (highPriceInAll - 3 * incAxis).toFixed(2);
	data.value.yAxisText5 = (lowPriceInAll).toFixed(2);

	data.value.dataLoaded = true;
}

defineExpose({ requestDayK, requestWeekK, requestMonthK, requestYearK });
</script>

<style scoped>
.kchart-container {
	background-color: #fff;
	height: 570px;
	padding: 20px;
	box-sizing: border-box;
	margin-bottom: 20px;
}

.stock-name {
	text-align: center;
	font-size: 22px;
	font-weight: 700;
	height: 30px;
	line-height: 30px;
}

.candle-container {
	display: flex;  /* or display: inline-flex; */
    flex-wrap: nowrap;
    overflow-x: auto;
    width: calc(100vw - 340px); /* or any specific width */
    white-space: nowrap;
	height: 520px;
}
</style>
