<template>
    <div style="margin-top: 20px; display: flex; gap: 20px;">
        <Card style="flex: 1;">
            <div class="stock-dailly-money-title-box">
                <div class="stock-dailly-money-title">腾落线</div>
            </div>
            <div class="date-range-box">
				<div class="date-range-label" style="margin-left: 10px;">开始日期</div>
				<DatePicker :model-value="data.adLineStartStr"
					type="date" placeholder="Select date" style="width: 200px"
					@on-change="onAdLineStartChange"/>
				<div class="date-range-label">结束日期</div>
				<DatePicker :model-value="data.adLineEndStr" 
					type="date" placeholder="Select date" style="width: 200px" 
					@on-change="onAdLineEndChange" />
			</div>
            <ECharts v-if="adLineChartOptions.series.length" :options="adLineChartOptions" />
        </Card>
        <Card style="flex: 1;">
			<div class="stock-dailly-money-title-box">
                <div class="stock-dailly-money-title">主线趋势</div>
				<Tooltip :content="`每天统计下最近六日的最高价突破历史最高价的股票数`"
					:max-width="300" placement="top">
					<Icon type="ios-alert" />
				</Tooltip>
            </div>
            <div class="date-range-box">
				<div class="date-range-label" style="margin-left: 10px;">开始日期</div>
				<DatePicker :model-value="data.highPriceStartStr"
					type="date" placeholder="Select date" style="width: 200px"
					@on-change="onHighPriceStartChange"/>
				<div class="date-range-label">结束日期</div>
				<DatePicker :model-value="data.highPriceEndStr" 
					type="date" placeholder="Select date" style="width: 200px" 
					@on-change="onHighPriceEndChange" />
			</div>
            <ECharts v-if="highPriceChartOptions.series.length" @click="params => gotoCustomStocks(params, {type: 'highPrice'})" :options="highPriceChartOptions" />
        </Card>
    </div>
	<div style="margin-top: 20px; display: flex; gap: 20px;">
		<Card style="flex: 1;">
            <div class="stock-dailly-money-title-box">
                <div class="stock-dailly-money-title">创业板指 / 中证红利指数</div>
            </div>
            <div class="date-range-box">
				<div class="date-range-label" style="margin-left: 10px;">开始日期</div>
				<DatePicker :model-value="data.cybZzhlStartStr"
					type="date" placeholder="Select date" style="width: 200px"
					@on-change="onCybZzhlStartChange" />
				<div class="date-range-label">结束日期</div>
				<DatePicker :model-value="data.cybZzhlEndStr" 
					type="date" placeholder="Select date" style="width: 200px" 
					@on-change="onCybZzhlEndChange" />
				<div class="cyb-zzhl-btn-group">
					<ButtonGroup class="button-group">
						<Button @click="onCybZzhlTypeChange('day')" :type="data.cybZzhlType === 'day' ? 'primary' : 'default'">天</Button>
						<Button @click="onCybZzhlTypeChange('month')" :type="data.cybZzhlType === 'month' ? 'primary' : 'default'">月</Button>
					</ButtonGroup>
				</div>
			</div>
            <ECharts v-if="cybZzhlChartOptions.series.length" :options="cybZzhlChartOptions" />
        </Card>
		<Card style="flex: 1;">
            <div class="stock-dailly-money-title-box">
                <div class="stock-dailly-money-title">创业板指</div>
            </div>
            <div class="date-range-box">
				<div class="date-range-label" style="margin-left: 10px;">开始日期</div>
				<DatePicker :model-value="data.cybStartStr"
					type="date" placeholder="Select date" style="width: 200px"
					@on-change="onCybStartChange"/>
				<div class="date-range-label">结束日期</div>
				<DatePicker :model-value="data.cybEndStr" 
					type="date" placeholder="Select date" style="width: 200px" 
					@on-change="onCybEndChange" />
			</div>
            <ECharts v-if="cybChartOptions.series.length" :options="cybChartOptions" />  
        </Card>
	</div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref, computed } from 'vue';
import ECharts from '../common/echarts.vue';
import { formatLocalYMD, getPreDay } from '../../../util/date';
import config from '../../../config/config';
import * as stockNetUtil from '../../../util/stock_net_util';

let data = ref({
	adLineStartStr: formatLocalYMD(new Date(new Date().getTime() - 365 * 24 * 3600 * 1000)), // '2024-09-15'
    adLineEndStr: formatLocalYMD(new Date()), // 2025-06-12
	highPriceStartStr: '2026-01-01', // '2024-09-15'
    highPriceEndStr: formatLocalYMD(new Date()), // 2025-06-12
	cybZzhlType: 'month',
	cybZzhlStartStr: '2010-01-01',
	cybZzhlEndStr: formatLocalYMD(new Date()), // 2025-06-12
	cybStartStr: '2010-01-01',
	cybEndStr: formatLocalYMD(new Date()), // 2025-06-12
});

const adLineChartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis',
        formatter: function(params) {
			const name = params[0].name;
			const value = params[0].data.value;
			return `${name}<br/>值：${value.toFixed(2)}`;
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
		min: -15000, // 固定从 min 开始
		scale: true, // 关键！开启后弱化0基线，适合观察波动
	},
	series: []
});

const highPriceChartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis',
        formatter: function(params) {
			const name = params[0].name;
			const value = params[0].data.value;
			return `${name}<br/>值：${value.toFixed(2)}`;
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

const cybZzhlChartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis',
        formatter: function(params) {
			const name = params[0].name;
			const value = params[0].data.value;
			return `${name}<br/>值：${value.toFixed(2)}`;
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

const cybChartOptions = ref({
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
		min: 0, // 固定从 min 开始
		scale: true, // 关键！开启后弱化0基线，适合观察波动
	},
	series: []
});

onMounted(async () => {
    requestAdLineData();
	requestHighPriceTendData();
	requestCybZzhlData();
	requestCybData();
});

async function requestAdLineData() {
	const res = await axios({
		method: 'get',
		url: config.url + `/api/statistics/daily/adline?start=${data.value.adLineStartStr}&end=${data.value.adLineEndStr}`
	});
	let resData = res.data.data;

    let series = [
		{
			name: '',
			type: 'line',
			data: resData.list.map(item => {
				return {
					value: item.adLine,
				}
			})
		}
	];

	let dates = resData.list.map(item => item.date);
	adLineChartOptions.value.xAxis.data = dates;
	adLineChartOptions.value.series = series;
}

async function requestHighPriceTendData() {
	const res = await axios({
		method: 'get',
		url: config.url + `/api/statistics/daily/highprice/tend?start=${data.value.highPriceStartStr}&end=${data.value.highPriceEndStr}`
	});
	let resData = res.data.data;

    let series = [
		{
			name: '',
			type: 'line',
			data: resData.list.map(item => {
				return {
					value: item.count,
					...item // 把原始所有字段放进来, date, count, stocks
				}
			})
		}
	];

	let dates = resData.list.map(item => item.date);
	highPriceChartOptions.value.xAxis.data = dates;
	highPriceChartOptions.value.series = series;
}

async function requestCybZzhlData() {
	const res = await axios({
		method: 'get',
		url: config.url + `/api/statistics/daily/cyb_zzhl?start=${data.value.cybZzhlStartStr}&end=${data.value.cybZzhlEndStr}&type=${data.value.cybZzhlType}`
	});
	let resData = res.data.data;

    let series = [
		{
			name: '',
			type: 'line',
			data: resData.list.map(item => {
				return {
					value: item.value,
				}
			})
		}
	];

	let dates = resData.list.map(item => item.date);
	cybZzhlChartOptions.value.xAxis.data = dates;
	cybZzhlChartOptions.value.series = series;
}

async function requestCybData() {
    let start = data.value.cybStartStr;
    let end = data.value.cybEndStr;
    let startDate = new Date(start);
	let endDate = new Date(end);
	let count = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());

	const list = await stockNetUtil.requestMonthK('sz399006', start, end, count);
    let series = [
		{
			name: '',
			type: 'line',
			data: list.map(item => {
				return {
					value: item[2],
				}
			})
		}
	];

	let dates = list.map(item => item[0]);
	cybChartOptions.value.xAxis.data = dates;
	cybChartOptions.value.series = series;
}

function onAdLineStartChange(dateStr) {
	data.value.adLineStartStr = dateStr;
    requestAdLineData();
}

function onAdLineEndChange(dateStr) {
	data.value.adLineEndStr = dateStr;
    requestAdLineData();
}

function onHighPriceStartChange(dateStr) {
	data.value.highPriceStartStr = dateStr;
    requestHighPriceTendData();
}

function onHighPriceEndChange(dateStr) {
	data.value.highPriceEndStr = dateStr;
    requestHighPriceTendData();
}

function onCybZzhlTypeChange(type) {
	data.value.cybZzhlType = type;
	if (type === 'month') {
		data.value.cybZzhlStartStr = '2010-01-01';
	} else {
		data.value.cybZzhlStartStr = new Date().toISOString().substring(0, 10); // '2027-01-01';
		for (let i = 0; i < 200; i++) {
			data.value.cybZzhlStartStr = getPreDay(data.value.cybZzhlStartStr);
		}
	}
	requestCybZzhlData();
}

function onCybZzhlStartChange(dateStr) {
	data.value.cybZzhlStartStr = dateStr;
    requestCybZzhlData();
}

function onCybZzhlEndChange(dateStr) {
	data.value.cybZzhlEndStr = dateStr;
    requestCybZzhlData();
}

function onCybStartChange(dateStr) {
    data.value.cybStartStr = dateStr;
    requestCybData();
}

function onCybEndChange(dateStr) {
    data.value.cybEndStr = dateStr;
    requestCybData();
}

async function gotoCustomStocks(params, option) {
	if (!(params.componentType === 'series' && params.seriesType === 'line')) {
		return;
	}
	let chartOptions;
	if (option.type === 'highPrice') {
		chartOptions = highPriceChartOptions;
	} else if (option.type === 'x') {

	}
	const serie = (chartOptions.series || chartOptions.value.series)[params.seriesIndex];

	const item = serie.data[params.dataIndex];

	let url = config.url + '/api/stocks/get_stocks_by_fullids';
	const res = await axios.post(url, {
		stockFullIds: item.stocks,
	});
	let gotoUrl = `/trade/tracked_kcharts?uuid=${res.data.data.uuid}`
	window.open(gotoUrl, '_blank');
}
</script>

<style lang="css" scoped>
.stock-dailly-money-title-box {
    display: flex;
	justify-content: center;  /* 水平居中 */
  	align-items: center;     /* 垂直居中（如果需要） */
    margin-bottom: 10px;
	font-size: 20px;
}

.stock-dailly-money-title {
    font-size: 20px;
    font-weight: bold;
	margin-right: 2px;
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

.cyb-zzhl-btn-group {
	text-align: center;
	margin-left: 10px;
}
</style>