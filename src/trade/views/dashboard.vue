<template>
    <div>
		<Card>
			<div class="total-shizhi-txt">
				<template v-if="data.shiZhi && data.shiZhi.amount">
					总市值: {{ (data.shiZhi.amount / 10000).toFixed(2) }}万亿 &nbsp;({{ data.shiZhi.count }}家)
				</template>
				<Icon @click="requestAllStockDetail" type="md-refresh" style="cursor: pointer;" />
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
		<Card>
			<div class="total-shizhi-txt">
				大盘指数
				<Icon @click="requestAllDailyBasic" type="md-refresh" style="cursor: pointer;" />
			</div>
		</Card>
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
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
	compositeIndex: null // 综合指数
})

onMounted(async () => {
	if (store.stockMarketStats) {
		data.value.shiZhi = store.stockMarketStats.shiZhi;
		data.value.shiZhiList = store.stockMarketStats.shiZhiList;
	}
});

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
	let compositeIndex = {};
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
			stock.items.forEach(item => {
				compositeIndex[item.trade_date] = compositeIndex[item.trade_date] || {
					index0: { amount: 0, count: 0 },
					index100: { amount: 0, count: 0 },
					index500: { amount: 0, count: 0 },
					index1000: { amount: 0, count: 0 },
					index2000: { amount: 0, count: 0 },
					index5000: { amount: 0, count: 0 },
					index10000: { amount: 0, count: 0 }
				};
				if (item.total_mv < 100) {
					compositeIndex[item.trade_date]['index0'].count += 1;
					compositeIndex[item.trade_date]['index0'].amount += item.total_mv;
				} else if (item.total_mv < 500) {
					compositeIndex[item.trade_date]['index100'].count += 1;
					compositeIndex[item.trade_date]['index100'].amount += item.total_mv;
				} else if (item.total_mv < 1000) {
					compositeIndex[item.trade_date]['index500'].count += 1;
					compositeIndex[item.trade_date]['index500'].amount += item.total_mv;
				} else if (item.total_mv < 2000) {
					compositeIndex[item.trade_date]['index1000'].count += 1;
					compositeIndex[item.trade_date]['index1000'].amount += item.total_mv;
				} else if (item.total_mv < 5000) {
					compositeIndex[item.trade_date]['index2000'].count += 1;
					compositeIndex[item.trade_date]['index2000'].amount += item.total_mv;
				} else if (item.total_mv < 10000) {
					compositeIndex[item.trade_date]['index5000'].count += 1;
					compositeIndex[item.trade_date]['index5000'].amount += item.total_mv;
				} else {
					compositeIndex[item.trade_date]['index10000'].count += 1;
					compositeIndex[item.trade_date]['index10000'].amount += item.total_mv;
				}
			});
		}
		let endTime = new Date().getTime();
		let timeout = 60 - (endTime - startTime);
		if (timeout <= 0) {
			timeout = 0;
		}
		timeout += 1;
		await sleep(timeout * 1000);
	}
	console.log('compositeIndex', compositeIndex);
	console.log('compositeIndex', JSON.stringify(compositeIndex));

	store.updateCompositeIndex({
		compositeIndex,
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
	text-align: center;
}
</style>
