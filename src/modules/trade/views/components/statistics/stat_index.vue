<template>
    <div style="margin-top: 20px; display: flex; gap: 20px;">
        <Card style="flex: 1;">
            <div class="stock-dailly-money-title-box">
                <div class="stock-dailly-money-title">全A等权指数</div>
            </div>
            <div class="date-range-box">
				<div class="date-range-label" style="margin-left: 10px;">开始日期</div>
				<DatePicker :model-value="data.equalWeightStartStr"
					type="date" placeholder="Select date" style="width: 200px"
					@on-change="onEqualWeightStartChange"/>
				<div class="date-range-label">结束日期</div>
				<DatePicker :model-value="data.equalWeightEndStr" 
					type="date" placeholder="Select date" style="width: 200px" 
					@on-change="onEqualWeightEndChange" />
			</div>
            <ECharts v-if="equalWeightChartOptions.series.length" :options="equalWeightChartOptions" />
        </Card>
        <Card style="flex: 1;">
            <div class="stock-dailly-money-title-box">
                <div class="stock-dailly-money-title">开户数</div>
            </div>
            <div class="date-range-box">
				<div class="date-range-label" style="margin-left: 10px;">开始日期</div>
				<DatePicker :model-value="data.openAccountCountStartStr"
					type="date" placeholder="Select date" style="width: 200px"
					@on-change="onOpenAccountCountStartChange"/>
				<div class="date-range-label">结束日期</div>
				<DatePicker :model-value="data.openAccountCountEndStr" 
					type="date" placeholder="Select date" style="width: 200px" 
					@on-change="onOpenAccountCountEndChange" />
			</div>
            <ECharts v-if="openAccountCountChartOptions.series.length" :options="openAccountCountChartOptions" />  
        </Card>
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref, computed } from 'vue';
import ECharts from '../common/echarts.vue';
import { formatLocalYMD, getDayDiff } from '../../../util/date';
import config from '../../../config/config';

let data = ref({
	equalWeightStartStr: formatLocalYMD(new Date(new Date().getTime() - 365 * 24 * 3600 * 1000)), // '2024-09-15'
    equalWeightEndStr: formatLocalYMD(new Date()), // 2025-06-12
    openAccountCountStartStr: formatLocalYMD(new Date(new Date().getTime() - 365 * 24 * 3600 * 1000)), // '2024-09-15'
    openAccountCountEndStr: formatLocalYMD(new Date()), // 2025-06-12
});

const equalWeightChartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis',
        formatter: function(params) {
			const name = params[0].name;
			const value = params[0].data.value;
			return `${name}<br/>指数：${value.toFixed(2)}`;
		}
	},
    legend: {
		data: []
	},
	xAxis: {
		type: 'category',
		data: []
	},
	yAxis: {
		type: 'value',
		min: 1000, // 固定从 1000 开始
		scale: true, // 关键！开启后弱化0基线，适合观察波动
	},
	series: []
});

const openAccountCountChartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis',
        formatter: function(params) {
			const name = params[0].name;
			const value = params[0].data.value;
			return `${name}<br/>开户数：${value.toFixed(2)}`;
		}
	},
    legend: {
		data: []
	},
	xAxis: {
		type: 'category',
		data: []
	},
	yAxis: {
		type: 'value',
		min: 0, // 固定从 min 开始
		scale: true, // 关键！开启后弱化0基线，适合观察波动
	},
	series: []
});

onMounted(async () => {
    requestEqualWeightData();
    requestOpenAccountCountData();
});

async function requestEqualWeightData() {
	const res = await axios({
		method: 'get',
		url: config.url + `/api/statistics/daily/a_equal_weight_index?start=${data.value.equalWeightStartStr}&end=${data.value.equalWeightEndStr}`
	});
	let resData = res.data.data;

    let series = [
		{
			name: '',
			type: 'line',
			data: resData.list.map(item => {
				return {
					value: item.indexPoint,
				}
			})
		}
	];

	let dates = resData.list.map(item => item.date);
	equalWeightChartOptions.value.xAxis.data = dates;
	equalWeightChartOptions.value.series = series;
}

async function requestOpenAccountCountData() {
    let start = data.value.openAccountCountStartStr;
    let end = data.value.openAccountCountEndStr;
    const res = await axios({
		method: 'get',
		url: config.url + `/api/statistics/open_account?start=${start}&end=${end}`
	});
	let resData = res.data.data;

    let series = [
		{
			name: '',
			type: 'line',
			data: resData.list.map(item => {
				return {
					value: item.count,
				}
			})
		}
	];

	let dates = resData.list.map(item => item.date);
	openAccountCountChartOptions.value.xAxis.data = dates;
	openAccountCountChartOptions.value.series = series;
}

function onEqualWeightStartChange(dateStr) {
	data.value.equalWeightStartStr = dateStr;
    requestEqualWeightData();
}

function onEqualWeightEndChange(dateStr) {
	data.value.equalWeightEndStr = dateStr;
    requestEqualWeightData();
}

function onOpenAccountCountStartChange(dateStr) {
    data.value.openAccountCountStartStr = dateStr;
    requestOpenAccountCountData();
}

function onOpenAccountCountEndChange(dateStr) {
    data.value.openAccountCountEndStr = dateStr;
    requestOpenAccountCountData();
}
</script>

<style lang="css" scoped>
.stock-dailly-money-title-box {
    display: flex;
    margin-bottom: 10px;
}

.stock-dailly-money-title {
    flex: 1;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
}

.date-range-box {
    display: flex;
    align-items: center;
    justify-content: center;
}

.date-range-label {
    line-height: 32px;
    margin-left: 10px;
    margin-right: 10px;
}
</style>