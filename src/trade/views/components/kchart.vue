<template>
    <div>
        <div>
            <div v-for="(item, i) in data.myKList" :key="i">
                <Candle
                    :stockId="stockId"
                    :candleType="data.candleType"
                    :date="item[0]"
                    :openPrice="item[1]"
                    :closePrice="item[2]"
                    :highPrice="item[3]"
                    :lowPrice="item[4]"
                    :volume="item[5]"
                    :lowPriceInAll="data.lowPriceInAll"
                    :highPriceInAll="data.highPriceInAll"
                    :maxCandleHeight="data.maxCandleHeight"
                    :lowVolumeInAll="data.lowVolumeInAll"
                    :highVolumeInAll="data.highVolumeInAll"
                    :maxVolumeHeight="data.maxVolumeHeight"
                />
                <Volume
                    :stockId="stockId"
                    :candleType="data.candleType"
                    :date="item[0]"
                    :openPrice="item[1]"
                    :closePrice="item[2]"
                    :highPrice="item[3]"
                    :lowPrice="item[4]"
                    :volume="item[5]"
                    :lowPriceInAll="data.lowPriceInAll"
                    :highPriceInAll="data.highPriceInAll"
                    :maxCandleHeight="data.maxCandleHeight"
                    :lowVolumeInAll="data.lowVolumeInAll"
                    :highVolumeInAll="data.highVolumeInAll"
                    :maxVolumeHeight="data.maxVolumeHeight"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findFromRight } from '../util/str';
import axios from 'axios';

const route = useRoute()
const router = useRouter()

const props = defineProps([
    'stockId',
    'stock',
    'stockName'
])

let data = ref({
    lowPriceInAll: 0,
	highPriceInAll: 0,
	lowVolumeInAll: 0,
	highVolumeInAll: 0,
    maxCandleHeight: 500,
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

async function requestDayK(start, end, count) {
    data.value.end = end;
    var url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
	url += (stock + ",day," + start + "," + end + "," + count + ",qfq");
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
	if (res.data.data[stock]['qfqday']) {
		myKList = res.data.data[stock].qfqday;
    } else {
		myKList = res.data.data[stock].day;
    }
	requestToday(stock)
}

async function requestToday(stock) {
	var url = "https://qt.gtimg.cn/q=" + stock;

	let res = await axios.get(url, {
        responseType: 'arraybuffer' 
    });
    if (!(res.data && res.data.data)) {
		return;
    }

    let gbkData = res.data.data;
    const decoder = new TextDecoder('gbk');
    const utf8String = decoder.decode(gbkData);
    const jsonStr = utf8String;
	if (!jsonStr) {
        return;
    }
	var todayStr = ""
	var index =  str.indexOf('"');
	if (index > 0) {
		todayStr = jsonStr.substr(index + 1);
    }
	index = findFromRight(todayStr, '"');
	if (index > 0) {
		todayStr = todayStr.substr(0, index)
    }

	var todayData = todayStr.split('~');
	myKList.push([
		end,
		todayData[5],  // 开盘价
		todayData[3],  // 收盘价
		todayData[33], // 最高价
		todayData[34], // 最低价
		todayData[6],  // 总手
	]);
	updateChart("day");
}

async function requestWeekK(start, end, count) {
	var url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
	url += (stock + ",week," + start + "," + end + "," + count + ",qfq");
	let res = await axios.get(url);
	
	if (!(res.data && res.data.data)) {
		return;
    }
		
    if (res.data.data[stock]['qfqweek']) {
		myKList = res.data.data[stock].qfqweek;
    } else {
		myKList = res.data.data[stock].week;
    }
		
	let dates = []
	for (let i = 0; i < myKList.length; i++) {
		dates.push(myKList[i][0]);
    }
	updateChart("week")
}

async function requestMonthK(start, end, count) {
	var url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=";
	url += (stock + ",month," + start + "," + end + "," + count + ",qfq");

	let res = await axios.get(url);
	
	if (!(res.data && res.data.data)) {
		return;
    }
		
    if (res.data.data[stock]['qfqmonth']) {
		myKList = res.data.data[stock].qfqmonth;
    } else {
		myKList = res.data.data[stock].month;
    }
		
	let dates = []
	for (let i = 0; i < myKList.length; i++) {
		dates.push(myKList[i][0]);
    }
	updateChart("month")
}

async function requestYearK(start, end, count) {
	var url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
	url += (stock + ",month," + start + "," + _end + "," + count + ",qfq");

	let res = await axios.get(url);
	
	if (!(res.data && res.data.data)) {
		return;
    }
		
    let monthData;
    if (res.data.data[stock]['qfqmonth']) {
		monthData = res.data.data[stock].qfqmonth;
    } else {
		monthData = res.data.data[stock].month;
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

		if (i + 1 < monthData.size()) {
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
	for (key in yearMap) {
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

	myKList = yearList;
	
	var dates = [];
    for (let i = 0; i < myKList.length; i++) {
		dates.push(myKList[i][0]);
    }
	updateChart("year")
}

function updateChart(candleType) {
	let lowPriceInAll = 10000000
	let highPriceInAll = -10000000
	let lowVolumeInAll = 10000000
	let highVolumeInAll = -10000000

	data.value.candles = [];
    data.value.volumes = [];
    data.value.candleType = candleType;

    for (let i = 0; i < myKList.length; i++) {
		var highPrice = Number(myKList[i][3])
		var lowPrice = Number(myKList[i][4])
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

        myKList[i][1] = Number(myKList[i][1]);
		myKList[i][2] = Number(myKList[i][2]);
		myKList[i][3] = Number(myKList[i][3]);
		myKList[i][4] = Number(myKList[i][4]);
		myKList[i][5] = Number(myKList[i][5]);
    }
	
	var incAxis = (highPriceInAll - lowPriceInAll) / 4
	yAxisText1 = highPriceInAll.toFixed(2);
	yAxisText2 = (highPriceInAll - incAxis).toFixed(2);
	yAxisText3 = (highPriceInAll - 2 * incAxis).toFixed(2);
	yAxisText4 = (highPriceInAll - 3 * incAxis).toFixed(2);
	yAxisText5 = (lowPriceInAll).toFixed(2);
}
</script>
