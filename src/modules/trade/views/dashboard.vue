<template>
    <div>
		<div style="display: flex; gap: 20px; margin-bottom: 20px;">
			<Card style="flex: 1">
				<ECharts v-if="shiZhiPiChartOptions.series.length" :options="shiZhiPiChartOptions" />
			</Card>
			<Card style="flex: 1"></Card>
		</div>
		<Card>
			<div class="total-shizhi-txt">
				<div v-if="data.shiZhi && data.shiZhi.amount">总市值: {{ (data.shiZhi.amount / 10000).toFixed(2) }}万亿 &nbsp;({{ data.shiZhi.count }}家) </div>
				<Icon class="refresh" @click="requestAllStockDetail" type="md-refresh" style="cursor: pointer;" />
				<div class="updated-at">{{ data.updatedAt1 ? '更新于 ' + data.updatedAt1 : '' }}</div>
			</div>
			<Table border :columns="data.columns" :data="data.shiZhiList">
				<template #shiZhi0="{ row }">
					<div class="goto-kcharts" @click="gotoKCharts('shiZhi0')">{{ row.shiZhi0.count }}家 ({{ row.shiZhi0.percent }}%)</div>
				</template>
				<template #shiZhi1="{ row }">
					<div class="goto-kcharts" @click="gotoKCharts('shiZhi1')">{{ row.shiZhi1.count }}家 ({{ row.shiZhi1.percent }}%)</div>
				</template>
				<template #shiZhi2="{ row }">
					<div class="goto-kcharts" @click="gotoKCharts('shiZhi2')">{{ row.shiZhi2.count }}家 ({{ row.shiZhi2.percent }}%)</div>
				</template>
				<template #shiZhi3="{ row }">
					<div class="goto-kcharts" @click="gotoKCharts('shiZhi3')">{{ row.shiZhi3.count }}家 ({{ row.shiZhi3.percent }}%)</div>
				</template>
				<template #shiZhi4="{ row }">
					<div class="goto-kcharts" @click="gotoKCharts('shiZhi4')">{{ row.shiZhi4.count }}家 ({{ row.shiZhi4.percent }}%)</div>
				</template>
				<template #shiZhi5="{ row }">
					<div class="goto-kcharts" @click="gotoKCharts('shiZhi5')">{{ row.shiZhi5.count }}家 ({{ row.shiZhi5.percent }}%)</div>
				</template>
				<template #shiZhi6="{ row }">
					<div class="goto-kcharts" @click="gotoKCharts('shiZhi6')">{{ row.shiZhi6.count }}家 ({{ row.shiZhi6.percent }}%)</div>
				</template>
			</Table>
		</Card>
		<Card style="margin: 20px 0;">
			<div class="total-shizhi-txt">
				<div>大盘总市值(单位: 万亿)</div>
				<Icon class="refresh" @click="requestAllDailyBasic" type="md-refresh" style="cursor: pointer;" />
				<div class="updated-at">{{ data.updatedAt2 ? '更新于 ' + data.updatedAt2 : '' }}</div>
			</div>
			<div class="shizhi-date-box">
				<div class="date-label" style="margin-left: 10px;">开始日期</div>
				<DatePicker :model-value="data.shiZhiStartDateStr"
					type="date" placeholder="Select date" style="width: 200px"
					@on-change="onShiZhiStartDateChange"/>
				<div class="date-label date-label-end">结束日期</div>
				<DatePicker :model-value="data.shiZhiEndDateStr" 
					type="date" placeholder="Select date" style="width: 200px" 
					@on-change="onShiZhiEndDateChange" />
			</div>
			<ECharts v-if="chartOptions.series.length" :options="chartOptions" />
		</Card>
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { Message } from 'view-ui-plus';
import ECharts from './components/common/echarts.vue'
import store from '../model/store';
import { formatLocalYMD, utcStringToLocalString } from '../util/date';
import { useRouter } from 'vue-router';

const router = useRouter()

let data = ref({
	columns: [
		{
			title: '小于100亿',
			slot: 'shiZhi0',
		},
		{
			title: '[100亿, 500亿)',
			slot: 'shiZhi1'
		},
		{
			title: '[500亿, 1000亿)',
			slot: 'shiZhi2'
		},
		{
			title: '[1000亿, 2000亿)',
			slot: 'shiZhi3'
		},
		{
			title: '[2000亿, 5000亿)',
			slot: 'shiZhi4'
		},
		{
			title: '[5000亿, 1万亿)',
			slot: 'shiZhi5'
		},
		{
			title: '1万亿以上',
			slot: 'shiZhi6'
		}
	],
	shiZhi0: { // 100亿以下
		count: 0,
		percent: 0,
	},
	shiZhi1: { // 100亿-500亿
		count: 0,
		percent: 0,
	},
	shiZhi2: { // 500亿-1000亿
		count: 0,
		percent: 0,
	},
	shiZhi3: { // 1000亿-2000亿
		count: 0,
		percent: 0,
	},
	shiZhi4: { // 2000亿-5000亿
		count: 0,
		percent: 0,
	},
	shiZhi5: { // 5000亿-1万亿
		count: 0,
		percent: 0,
	},
	shiZhi6: { // 1万亿以上
		count: 0,
		percent: 0,
	},
	shiZhiList: [], // 市值分布列表
	shiZhi: {
		amount: 0, // 所有公司的总市值
		count: 0, // 一共有多少个公司
	},
	updatedAt1: '',
	compositeIndex: null, // 综合指数
	updatedAt2: '',
	shiZhiStartDateStr: formatLocalYMD(new Date(new Date().getTime() - 3 * 365 * 24 * 3600 * 1000)), // '2024-09-15'
    shiZhiEndDateStr: formatLocalYMD(new Date()), // 2025-06-12
});

const shiZhiPiChartOptions = ref({
  title: {
    text: '市值分布',
	subtext: '',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
	formatter: '{b}<br/>公司数：{c}<br/>百分比：{d}%'
  },
  series: [
    {
      type: 'pie',
      radius: '50%',
      data: [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
});

let legendData = [
	'全部', '小于100亿', '[100亿, 500亿)', '[500亿, 1000亿)', '[1000亿, 2000亿)', '[2000亿, 5000亿)', '[5000亿, 1万亿)', '1万亿以上'
];

const chartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis'
	},
	// legend: {
	// 	data: legendData
	// },
	xAxis: {
		type: 'category',
		data: []
	},
	yAxis: {
		type: 'value'
	},
	series: []
});

onMounted(async () => {
	if (store.stockMarketStats) {
		data.value.shiZhi = store.stockMarketStats.shiZhi;
		data.value.shiZhiList = store.stockMarketStats.shiZhiList;
		console.log('store.stockMarketStats.shiZhiList', store.stockMarketStats.shiZhiList);
		data.value.updatedAt1 = utcStringToLocalString(store.stockMarketStats.updatedAt);

		let arr = [];
		for (let key in store.stockMarketStats.shiZhiList[0]) {
			let item = store.stockMarketStats.shiZhiList[0][key];
			arr.push({ value: item.count, name: key });
		}
		shiZhiPiChartOptions.value.title.subtext = '总市值 ' + (store.stockMarketStats.shiZhi.amount / 10000).toFixed(2) + '万亿';
		shiZhiPiChartOptions.value.series[0].data = arr;
	}
	updateChart();
});

function updateChart() {
	if (!store.compositeIndex) {
		return;
	}
	data.value.updatedAt2 = utcStringToLocalString(store.compositeIndex.updatedAt);
	let indexArr = [
		'index',
		// 'index0',
		// 'index1',
		// 'index2',
		// 'index3',
		// 'index4',
		// 'index5',
		// 'index6',
	];
	let series = [];
	let allDates;
	for (let i = 0; i < indexArr.length; i++) {
		// indexData 为 { '20050620' { amount: 0, count: 0 } }
		let indexData = store.compositeIndex[indexArr[i]];
		let arr = [];
		let startStr = data.value.shiZhiStartDateStr.replaceAll('-', '');
		let endStr = data.value.shiZhiEndDateStr.replaceAll('-', '');
		console.log('startStr ->', startStr);
		console.log('endStr ->', endStr);
		for (let date in indexData) {
			if (date < startStr || date > endStr) {
				continue;
			}
			arr.push({
				date,
				amount: indexData[date].amount,
				count: indexData[date].count
			});
		}
		arr.sort((a, b) => a.date > b.date ? 1 : -1);
		series.push({
			name: legendData[i],
			type: 'line',
			data: arr.map(item => Number(item.amount / 10000).toFixed(2)), // 转换为万亿
		});

		if (!allDates) {
			allDates = [];
			for (let i = 0; i < arr.length; i++) {
				allDates.push(arr[i].date);
			}
		}
	}
	console.log('allDates', allDates);
	chartOptions.value.xAxis.data = allDates;
	chartOptions.value.series = series;
}

function resetData() {
	const defaultData = { count: 0, percent: 0 };
	data.value.shiZhiList = [];
	data.value.shiZhi0 = { ...defaultData };
	data.value.shiZhi1 = { ...defaultData };
	data.value.shiZhi2 = { ...defaultData };
	data.value.shiZhi3 = { ...defaultData };
	data.value.shiZhi4 = { ...defaultData };
	data.value.shiZhi5 = { ...defaultData };
	data.value.shiZhi6 = { ...defaultData };
	data.value.shiZhi = {
		amount: 0,
		count: 0,
	};
}

async function requestAllStockDetail() {
	resetData();

	const res = await axios({
		method: 'get',
		url: 'http://127.0.0.1:3000/api/statistics/shizhi'
	});
	if (!(res.data.code === 0 && res.data.data)) {
		Message.error({
			duration: 10,
			content: `大盘市值更新失败`
		});
		return
	}
	let theData = res.data.data;

	let arr = [];
	for (let key in theData.shiZhiList) {
		let item = theData.shiZhiList[key];
		arr.push({ value: item.count, name: item.name });
	}
	shiZhiPiChartOptions.value.title.subtext = '总市值 ' + (theData.shiZhi.amount / 10000).toFixed(2) + '万亿';
	shiZhiPiChartOptions.value.series[0].data = arr;

	return;


	let allStocks = store.allStocks || [];
	let concurrence = 100;
	let allStocksWithZongShiZhi = [];
	for (let i = 0; i < allStocks.length; i += concurrence) {
		let tasks = [];
		console.log('requestAllStockDetail', i, new Date().toISOString());
		for (let j = i; j < i + concurrence && j < allStocks.length; j++) {
			tasks.push(requestStockDetail(allStocks[j]));
		}
		let list = await Promise.all(tasks);
		for (let stock of list) {
			if (stock) {
				allStocksWithZongShiZhi.push(stock);
				data.value.shiZhi.count += 1;
				data.value.shiZhi.amount += stock.zongShiZhi || 0;
				if (stock.zongShiZhi < 100) {
					data.value.shiZhi0.count += 1;
				} else if (stock.zongShiZhi < 500) {
					data.value.shiZhi1.count += 1;
				} else if (stock.zongShiZhi < 1000) {
					data.value.shiZhi2.count += 1;
				} else if (stock.zongShiZhi < 2000) {
					data.value.shiZhi3.count += 1;
				} else if (stock.zongShiZhi < 5000) {
					data.value.shiZhi4.count += 1;
				} else if (stock.zongShiZhi < 10000) {
					data.value.shiZhi5.count += 1;
				} else {
					data.value.shiZhi6.count += 1;
				}
			}
		}
		let theCount = data.value.shiZhi.count;
		data.value.shiZhi0.percent = (data.value.shiZhi0.count / theCount * 100).toFixed(2);
		data.value.shiZhi1.percent = (data.value.shiZhi1.count / theCount * 100).toFixed(2);
		data.value.shiZhi2.percent = (data.value.shiZhi2.count / theCount * 100).toFixed(2);
		data.value.shiZhi3.percent = (data.value.shiZhi3.count / theCount * 100).toFixed(2);
		data.value.shiZhi4.percent = (data.value.shiZhi4.count / theCount * 100).toFixed(2);
		data.value.shiZhi5.percent = (data.value.shiZhi5.count / theCount * 100).toFixed(2);
		data.value.shiZhi6.percent = (data.value.shiZhi6.count / theCount * 100).toFixed(2);
	}
	data.value.shiZhiList = [
		{
			shiZhi0: data.value.shiZhi0,
			shiZhi1: data.value.shiZhi1,
			shiZhi2: data.value.shiZhi2,
			shiZhi3: data.value.shiZhi3,
			shiZhi4: data.value.shiZhi4,
			shiZhi5: data.value.shiZhi5,
			shiZhi6: data.value.shiZhi6
		}
	];
	store.updateStockMarketStats({
		shiZhi: data.value.shiZhi,
		shiZhiList: data.value.shiZhiList,
		updatedAt: new Date().toISOString()
	});
	store.setAllStocksWithZongShiZhi(allStocksWithZongShiZhi);
	console.log('requestAllStockDetail done');
}

async function requestStockDetail(stock) {
	let url = `https://sqt.gtimg.cn/?q=${stock.stockFullId}&fmt=json&app=wzq&t=${Date.now()}`;
    let res = await axios.get(url);
	if (!(res.data && res.data[stock.stockFullId])) {
		return null;
	}
	let arr = res.data[stock.stockFullId] || [];
	return {
		stockId: stock.stockId,
		stockFullId: stock.stockFullId,
		stockName: stock.stockName,
		zongShiZhi: Number(arr[45] || '0'), // 总市值
	}
}

async function requestAllDailyBasic() {
	const res = await axios({
		method: 'get',
		url: 'http://127.0.0.1:3000/api/tushare/all_daily_basic'
	});
	if (!(res.data.code === 0 && res.data.data)) {
		Message.error({
			duration: 10,
			content: `大盘市值更新失败`
		});
		return
	}
	store.updateCompositeIndex({
		...res.data.data.compositeIndex,
		updatedAt: new Date().toISOString()
	});
	location.reload();
}

function onShiZhiStartDateChange(dateStr) {
	if (!store.compositeIndex) {
		return;
	}
	data.value.shiZhiStartDateStr = dateStr;
	store.updateCompositeIndex({
		...store.compositeIndex
	});
	updateChart();
}

function onShiZhiEndDateChange(dateStr) {
	if (!store.compositeIndex) {
		return;
	}
	data.value.shiZhiEndDateStr = dateStr;
	store.updateCompositeIndex({
		...store.compositeIndex
	});
	updateChart();
}

function gotoKCharts(shiZhiType) {
	let allStocks = store.getAllStocksWithZongShiZhi() || [];
	let list = [];
	if (shiZhiType === 'shiZhi0') {
		list = allStocks.filter(stock => stock.zongShiZhi < 100);
	} else if (shiZhiType === 'shiZhi1') {
		list = allStocks.filter(stock => stock.zongShiZhi >= 100 && stock.zongShiZhi < 500);
	} else if (shiZhiType === 'shiZhi2') {
		list = allStocks.filter(stock => stock.zongShiZhi >= 500 && stock.zongShiZhi < 1000);
	} else if (shiZhiType === 'shiZhi3') {
		list = allStocks.filter(stock => stock.zongShiZhi >= 1000 && stock.zongShiZhi < 2000);
	} else if (shiZhiType === 'shiZhi4') {
		list = allStocks.filter(stock => stock.zongShiZhi >= 2000 && stock.zongShiZhi < 5000);
	} else if (shiZhiType === 'shiZhi5') {
		list = allStocks.filter(stock => stock.zongShiZhi >= 5000 && stock.zongShiZhi < 10000);
	} else if (shiZhiType === 'shiZhi6') {
		list = allStocks.filter(stock => stock.zongShiZhi >= 10000);
	}
	store.setSelectedStocks(list);
	router.push({ path: '/trade/selected_kcharts' });
}
</script>

<style scoped>
.total-shizhi-txt {
	font-size: 20px;
	font-weight: bold;
	margin-bottom: 20px;
	height: 36px;
	display: flex;
	justify-content: center;  /* 水平居中 */
  	align-items: center;     /* 垂直居中（如果需要） */
}

.updated-at {
	font-size: 14px;
	font-weight: 400;
}

.refresh {
	margin-left: 10px;
	margin-right: 5px;
}

.goto-kcharts {
	cursor: pointer;
}

.goto-kcharts:hover {
	color: #409eff;
}

.shizhi-date-box {
	display: flex;
    align-items: center;
    justify-content: center;
}

.date-label {
    margin-right: 10px;
    line-height: 32px;
}

.date-label-end {
    margin-left: 10px;
}
</style>
