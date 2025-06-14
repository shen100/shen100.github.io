<template>
    <div>
		<Card>
			<div class="total-shizhi-txt">
				<div v-if="data.shiZhi && data.shiZhi.amount">总市值: {{ (data.shiZhi.amount / 10000).toFixed(2) }}万亿 &nbsp;({{ data.shiZhi.count }}家) </div>
				<Icon class="refresh" @click="requestAllStockDetail" type="md-refresh" style="cursor: pointer;" />
				<div class="updated-at">{{ data.updatedAt1 ? '更新于 ' + data.updatedAt1 : '' }}</div>
			</div>
			<Table border :columns="data.columns" :data="data.shiZhiList">
				<template #shiZhi0="{ row }">
					<div>{{ row.shiZhi0.count }}家 ({{ row.shiZhi0.percent }}%)</div>
				</template>
				<template #shiZhi1="{ row }">
					<div>{{ row.shiZhi1.count }}家 ({{ row.shiZhi1.percent }}%)</div>
				</template>
				<template #shiZhi2="{ row }">
					<div>{{ row.shiZhi2.count }}家 ({{ row.shiZhi2.percent }}%)</div>
				</template>
				<template #shiZhi3="{ row }">
					<div>{{ row.shiZhi3.count }}家 ({{ row.shiZhi3.percent }}%)</div>
				</template>
				<template #shiZhi4="{ row }">
					<div>{{ row.shiZhi4.count }}家 ({{ row.shiZhi4.percent }}%)</div>
				</template>
				<template #shiZhi5="{ row }">
					<div>{{ row.shiZhi5.count }}家 ({{ row.shiZhi5.percent }}%)</div>
				</template>
				<template #shiZhi6="{ row }">
					<div>{{ row.shiZhi6.count }}家 ({{ row.shiZhi6.percent }}%)</div>
				</template>
			</Table>
		</Card>
		<Card style="margin: 20px 0;">
			<div class="total-shizhi-txt">
				<div>大盘市值</div>
				<Icon class="refresh" @click="requestAllDailyBasic" type="md-refresh" style="cursor: pointer;" />
				<div class="updated-at">{{ data.updatedAt2 ? '更新于 ' + data.updatedAt2 : '' }}</div>
			</div>
			<ECharts v-if="chartOptions.series.length" :options="chartOptions" />
		</Card>
		<Card>
			<div class="total-shizhi-txt">
				<div>大盘指数</div>
				<Icon class="refresh" @click="requestAllDailyBasic" type="md-refresh" style="cursor: pointer;" />
				<div class="updated-at">{{ data.updatedAt2 ? '更新于 ' + data.updatedAt2 : '' }}</div>
			</div>
			<ECharts v-if="zhiShuChartOptions.series.length" :options="zhiShuChartOptions" />
		</Card>
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import ECharts from './components/common/echarts.vue'
import store from '../model/store';
import { formatLocalYMD } from '../util/date';

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
	updatedAt2: ''
});

let legendData = [
	'小于100亿', '[100亿, 500亿)', '[500亿, 1000亿)', '[1000亿, 2000亿)', '[2000亿, 5000亿)', '[5000亿, 1万亿)', '1万亿以上', '全部'
];

const chartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis'
	},
	legend: {
		data: legendData
	},
	xAxis: {
		type: 'category',
		data: []
	},
	yAxis: {
		type: 'value'
	},
	series: []
});

const zhiShuChartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis'
	},
	legend: {
		data: legendData
	},
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
		data.value.updatedAt1 = store.stockMarketStats.updatedAt;
	}
	updateChart();
});

function updateChart() {
	if (!store.compositeIndex) {
		return;
	}
	data.value.updatedAt2 = store.compositeIndex.updatedAt;
	let indexArr = [
		'index0',
		'index1',
		'index2',
		'index3',
		'index4',
		'index5',
		'index6',
		'index'
	];
	let series = [];
	let zhiShuSeries = [];
	let allDates;
	for (let i = 0; i < indexArr.length; i++) {
		// indexData 为 { '20050620' { amount: 0, count: 0 } }
		let indexData = store.compositeIndex[indexArr[i]];
		let arr = [];
		for (let date in indexData) {
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
		zhiShuSeries.push({
			name: legendData[i],
			type: 'line',
			data: arr.map(item => parseInt(item.amount / item.count)),
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

	zhiShuChartOptions.value.xAxis.data = allDates;
	zhiShuChartOptions.value.series = zhiShuSeries;
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
	let allStocks = store.allStocks || [];
	let concurrence = 100;
	for (let i = 0; i < allStocks.length; i += concurrence) {
		let tasks = [];
		console.log('requestAllStockDetail', i, new Date().toISOString());
		for (let j = i; j < i + concurrence && j < allStocks.length; j++) {
			tasks.push(requestStockDetail(allStocks[j]));
		}
		let list = await Promise.all(tasks);
		for (let stock of list) {
			if (stock) {
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
		zongShiZhi: Number(arr[45] || '0'), // 总市值
	}
}

function sleep(timeout) {
	return new Promise(resolve => setTimeout(resolve, timeout));
}

async function requestAllDailyBasic() {
	let allStocks = store.allStocks || [];
	let concurrence = 200;
	let compositeIndex = {
		index: {}, // 整个大盘的数据
		index0: {},
		index1: {},
		index2: {},
		index3: {},
		index4: {},
		index5: {},
		index6: {},
	};
	for (let i = 0; i < allStocks.length; i += concurrence) {
		console.log('requestAllDailyBasic', i, new Date().toISOString());
		let startTime = new Date().getTime();
		let tasks = [];
		for (let j = i; j < i + concurrence && j < allStocks.length; j++) {
			tasks.push(requestDailyBasic(allStocks[j]));
		}
		let list = await Promise.all(tasks);
		for (let stock of list) {
			if (!stock) {
				continue;
			}
			if (!(stock.items && stock.items.length)) {
				continue;
			}
			// 用最新的市值来对公司进行分类，分到同一类的公司, 计算它们每天的市值合计、平均指数
			const newTotalMV = stock.items[stock.items.length - 1].total_mv;
			let indexNum = '';
			if (newTotalMV < 100) {
				indexNum = 'index0';
			} else if (newTotalMV < 500) {
				indexNum = 'index1';
			} else if (newTotalMV < 1000) {
				indexNum = 'index2';
			} else if (newTotalMV < 2000) {
				indexNum = 'index3';
			} else if (newTotalMV < 5000) {
				indexNum = 'index4';
			} else if (newTotalMV < 10000) {
				indexNum = 'index5';
			} else {
				indexNum = 'index6';
			}
			stock.items.forEach(item => {
				compositeIndex[indexNum][item.trade_date] = compositeIndex[indexNum][item.trade_date] || {
					amount: 0,
					count: 0
				};
				compositeIndex['index'][item.trade_date] = compositeIndex['index'][item.trade_date] || {
					amount: 0,
					count: 0
				};
				compositeIndex[indexNum][item.trade_date].count += 1;
				compositeIndex[indexNum][item.trade_date].amount += item.total_mv;
				compositeIndex['index'][item.trade_date].count += 1;
				compositeIndex['index'][item.trade_date].amount += item.total_mv;
			});
		}
		let endTime = new Date().getTime();
		let timeout = 60 * 1000 - (endTime - startTime);
		if (timeout <= 0) {
			timeout = 0;
		}
		timeout += 1000;
		await sleep(timeout);
	}

	store.updateCompositeIndex({
		...compositeIndex,
		updatedAt: new Date().toISOString()
	});
	console.log('requestAllDailyBasic done');
}

async function requestDailyBasic(stock) {
	let url = 'https://api.tushare.pro';
	let before = 20; // 查询多少年前的数据
	let startDate = formatLocalYMD(new Date(new Date().getTime() - before * 365 * 24 * 3600 * 1000)).replace(/-/g, '');
	let endDate = formatLocalYMD(new Date()).replace(/-/g, '');
	const reqData = {
		method: 'post',
		url,
		headers: {
			'content-type': 'application/json',
		},
		data: {
			token: store.tuShareToken,
			api_name: 'daily_basic',
			params: {
				ts_code: stock.ts_code,
				start_date: startDate,
				end_date: endDate
			}
		}
	};
	const res = await axios(reqData);
	if (!(res.data.code === 0 && res.data.data && res.data.data.items)) {
		return null;
	}
	let items = res.data.data.items.map((item) => {
		return {
			trade_date: item[1], // 交易日期
			total_mv: item[16] / 10000, // 总市值原始数据是万元，转换为亿
		}
	});
	return {
		stockId: stock.stockId,
		ts_code: stock.ts_code,
		items
	}
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
</style>
