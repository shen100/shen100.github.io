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
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import store from '../model/store';
import { formatLocalYMD } from '../util/date';
import { Card } from 'view-ui-plus';

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
	shiZhiList: [],
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
	shiZhi: {
		amount: 0, // 总市值
		count: 0,
		percent: 0,
	}
})

onMounted(async () => {
	if (store.stockMarketStats) {
		data.value.shiZhi = store.stockMarketStats.shiZhi;
		data.value.shiZhiList = store.stockMarketStats.shiZhiList;
	}
});

async function requestAllStockDetail() {
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
		updatedAt: formatLocalYMD(new Date())
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

</script>

<style scoped>
.total-shizhi-txt {
	font-size: 20px;
	font-weight: bold;
	margin-bottom: 20px;
	text-align: center;
}
</style>
