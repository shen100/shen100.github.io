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
                <div class="stock-dailly-money-title">上证指数</div>
            </div>
            <div class="date-range-box">
				<div class="date-range-label" style="margin-left: 10px;">开始日期</div>
				<DatePicker :model-value="data.shangZhengStartStr"
					type="date" placeholder="Select date" style="width: 200px"
					@on-change="onShangZhengStartChange"/>
				<div class="date-range-label">结束日期</div>
				<DatePicker :model-value="data.shangZhengEndStr" 
					type="date" placeholder="Select date" style="width: 200px" 
					@on-change="onShangZhengEndChange" />
			</div>
            <ECharts v-if="shangZhengChartOptions.series.length" :options="shangZhengChartOptions" />  
        </Card>
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref, computed } from 'vue';
import { Message } from 'view-ui-plus';
import ECharts from '../common/echarts.vue';
import { formatLocalYMD, getDayDiff } from '../../../util/date';
import config from '../../../config/config';
import * as stockNetUtil from '../../../util/stock_net_util';

let data = ref({
	equalWeightStartStr: formatLocalYMD(new Date(new Date().getTime() - 365 * 24 * 3600 * 1000)), // '2024-09-15'
    equalWeightEndStr: formatLocalYMD(new Date()), // 2025-06-12
    shangZhengStartStr: formatLocalYMD(new Date(new Date().getTime() - 365 * 24 * 3600 * 1000)), // '2024-09-15'
    shangZhengEndStr: formatLocalYMD(new Date()), // 2025-06-12
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

const shangZhengChartOptions = ref({
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
		min: 2500, // 固定从 2500 开始
		scale: true, // 关键！开启后弱化0基线，适合观察波动
	},
	series: []
});

onMounted(async () => {
    requestEqualWeightData();
    requestShangZhengData();
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

async function requestShangZhengData() {
    let start = data.value.shangZhengStartStr;
    let end = data.value.shangZhengEndStr;
    let count = getDayDiff(start, end);
	const list = await stockNetUtil.requestDayK('sh000001', start, end, count);
    let series = [
		{
			name: '成交额',
			type: 'line',
			data: list.map(item => {
				return {
					value: item[2],
				}
			})
		}
	];

	let dates = list.map(item => item[0]);
	shangZhengChartOptions.value.xAxis.data = dates;
	shangZhengChartOptions.value.series = series;
}

function onEqualWeightStartChange(dateStr) {
	data.value.equalWeightStartStr = dateStr;
    requestEqualWeightData();
}

function onEqualWeightEndChange(dateStr) {
	data.value.equalWeightEndStr = dateStr;
    requestEqualWeightData();
}

function onShangZhengStartChange(dateStr) {
    data.value.shangZhengStartStr = dateStr;
    requestShangZhengData();
}

function onShangZhengEndChange(dateStr) {
    data.value.shangZhengEndStr = dateStr;
    requestShangZhengData();
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