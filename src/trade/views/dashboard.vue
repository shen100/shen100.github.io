<template>
    <div>
		<Card>
			<div class="total-shizhi-txt">
				<template v-if="data.shiZhi && data.shiZhi.amount">
					<div>总市值: {{ (data.shiZhi.amount / 10000).toFixed(2) }}万亿 &nbsp;({{ data.shiZhi.count }}家) </div>
					<Icon class="refresh" @click="requestAllStockDetail" type="md-refresh" style="cursor: pointer;" />
					<div class="updated-at">{{ data.updatedAt1 ? '更新于 ' + data.updatedAt1 : '' }}</div>
				</template>
			</div>
			<Table border :columns="data.columns" :data="data.shiZhiList">
				<template #shiZhi0="{ row }">
					<div>{{ row.shiZhi0.count }}家 ({{ row.shiZhi0.percent }}%)</div>
				</template>
				<template #shiZhi100="{ row }">
					<div>{{ row.shiZhi100.count }}家 ({{ row.shiZhi100.percent }}%)</div>
				</template>
				<template #shiZhi500="{ row }">
					<div>{{ row.shiZhi500.count }}家 ({{ row.shiZhi500.percent }}%)</div>
				</template>
				<template #shiZhi1000="{ row }">
					<div>{{ row.shiZhi1000.count }}家 ({{ row.shiZhi1000.percent }}%)</div>
				</template>
				<template #shiZhi2000="{ row }">
					<div>{{ row.shiZhi2000.count }}家 ({{ row.shiZhi2000.percent }}%)</div>
				</template>
				<template #shiZhi5000="{ row }">
					<div>{{ row.shiZhi5000.count }}家 ({{ row.shiZhi5000.percent }}%)</div>
				</template>
				<template #shiZhi10000="{ row }">
					<div>{{ row.shiZhi10000.count }}家 ({{ row.shiZhi10000.percent }}%)</div>
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
			slot: 'shiZhi100'
		},
		{
			title: '[500亿, 1000亿)',
			slot: 'shiZhi500'
		},
		{
			title: '[1000亿, 2000亿)',
			slot: 'shiZhi1000'
		},
		{
			title: '[2000亿, 5000亿)',
			slot: 'shiZhi2000'
		},
		{
			title: '[5000亿, 1万亿)',
			slot: 'shiZhi5000'
		},
		{
			title: '1万亿以上',
			slot: 'shiZhi10000'
		}
	],
	shiZhi0: { // 100亿以下
		count: 0,
		percent: 0,
	},
	shiZhi100: { // 100亿-500亿
		count: 0,
		percent: 0,
	},
	shiZhi500: { // 500亿-1000亿
		count: 0,
		percent: 0,
	},
	shiZhi1000: { // 1000亿-2000亿
		count: 0,
		percent: 0,
	},
	shiZhi2000: { // 2000亿-5000亿
		count: 0,
		percent: 0,
	},
	shiZhi5000: { // 5000亿-1万亿
		count: 0,
		percent: 0,
	},
	shiZhi10000: { // 1万亿以上
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
	'100亿以下', '[100, 500)', '[500, 1000)', '[1000, 2000)', '[2000, 5000)', '[5000, 1万亿)', '1万亿以上'
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
		'index100',
		'index500',
		'index1000',		
		'index2000',
		'index5000',
		'index10000'
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
			data: arr.map(item => item.amount),
		});
		zhiShuSeries.push({
			name: legendData[i],
			type: 'line',
			data: arr.map(item => item.amount / item.count),
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
	data.value.shiZhi100 = { ...defaultData };
	data.value.shiZhi500 = { ...defaultData };
	data.value.shiZhi1000 = { ...defaultData };
	data.value.shiZhi2000 = { ...defaultData };
	data.value.shiZhi5000 = { ...defaultData };
	data.value.shiZhi10000 = { ...defaultData };
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
		console.log('i', i, allStocks[i]);
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
					data.value.shiZhi100.count += 1;
				} else if (stock.zongShiZhi < 1000) {
					data.value.shiZhi500.count += 1;
				} else if (stock.zongShiZhi < 2000) {
					data.value.shiZhi1000.count += 1;
				} else if (stock.zongShiZhi < 5000) {
					data.value.shiZhi2000.count += 1;
				} else if (stock.zongShiZhi < 10000) {
					data.value.shiZhi5000.count += 1;
				} else {
					data.value.shiZhi10000.count += 1;
				}
			}
		}
		let theCount = data.value.shiZhi.count;
		data.value.shiZhi0.percent = (data.value.shiZhi0.count / theCount * 100).toFixed(2);
		data.value.shiZhi100.percent = (data.value.shiZhi100.count / theCount * 100).toFixed(2);
		data.value.shiZhi500.percent = (data.value.shiZhi500.count / theCount * 100).toFixed(2);
		data.value.shiZhi1000.percent = (data.value.shiZhi1000.count / theCount * 100).toFixed(2);
		data.value.shiZhi2000.percent = (data.value.shiZhi2000.count / theCount * 100).toFixed(2);
		data.value.shiZhi5000.percent = (data.value.shiZhi5000.count / theCount * 100).toFixed(2);
		data.value.shiZhi10000.percent = (data.value.shiZhi10000.count / theCount * 100).toFixed(2);
	}
	data.value.shiZhiList = [
		{
			shiZhi0: data.value.shiZhi0,
			shiZhi100: data.value.shiZhi100,
			shiZhi500: data.value.shiZhi500,
			shiZhi1000: data.value.shiZhi1000,
			shiZhi2000: data.value.shiZhi2000,
			shiZhi5000: data.value.shiZhi5000,
			shiZhi10000: data.value.shiZhi10000
		}
	];
	store.updateStockMarketStats({
		shiZhi: data.value.shiZhi,
		shiZhiList: data.value.shiZhiList,
		updatedAt: new Date().toISOString()
	});
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
		index0: {},
		index100: {},
		index500: {},
		index1000: {},
		index2000: {},
		index5000: {},
		index10000: {},
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
				indexNum = 'index100';
			} else if (newTotalMV < 1000) {
				indexNum = 'index500';
			} else if (newTotalMV < 2000) {
				indexNum = 'index1000';
			} else if (newTotalMV < 5000) {
				indexNum = 'index2000';
			} else if (newTotalMV < 10000) {
				indexNum = 'index5000';
			} else {
				indexNum = 'index10000';
			}
			stock.items.forEach(item => {
				compositeIndex[indexNum][item.trade_date] = compositeIndex[indexNum][item.trade_date] || {
					amount: 0,
					count: 0
				};
				compositeIndex[indexNum][item.trade_date].count += 1;
				compositeIndex[indexNum][item.trade_date].amount += item.total_mv;
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
			total_mv: item[16], // / 10000, // 总市值原始数据是万元，转换为亿
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
