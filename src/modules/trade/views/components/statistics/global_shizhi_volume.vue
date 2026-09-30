<template>
    <div style="margin-top: 20px; display: flex; gap: 20px;">
        <Card style="flex: 1;">
			<div class="total-shizhi-txt">
				<div>大盘总市值(单位: 万亿)</div>
				<Icon class="refresh" @click="requestDaPanShiZhi" type="md-refresh" style="cursor: pointer;margin-left: 5px;" />
				<div class="updated-at" style="margin-left: 2px;">{{ data.updatedAt2 ? '更新于 ' + data.updatedAt2 : '' }}</div>
			</div>
			<div class="date-range-box">
				<div class="date-range-label" style="margin-left: 10px;">开始日期</div>
				<DatePicker :model-value="data.shiZhiStartDateStr"
					type="date" placeholder="Select date" style="width: 200px"
					@on-change="onShiZhiStartDateChange"/>
				<div class="date-range-label">结束日期</div>
				<DatePicker :model-value="data.shiZhiEndDateStr" 
					type="date" placeholder="Select date" style="width: 200px" 
					@on-change="onShiZhiEndDateChange" />
			</div>
			<ECharts v-if="shiZhiChartOptions.series.length" :options="shiZhiChartOptions" />
		</Card>
        <Card style="flex: 1;">
            <div class="stock-dailly-money-title-box">
                <div class="stock-dailly-money-title">大盘成交量</div>
            </div>
            <div class="date-range-box">
				<div class="date-range-label" style="margin-left: 10px;">开始日期</div>
				<DatePicker :model-value="data.volumeStartStr"
					type="date" placeholder="Select date" style="width: 200px"
					@on-change="onVolumeStartChange"/>
				<div class="date-range-label">结束日期</div>
				<DatePicker :model-value="data.volumeEndStr" 
					type="date" placeholder="Select date" style="width: 200px" 
					@on-change="onVolumeEndChange" />
			</div>
            <ECharts v-if="volumeChartOptions.series.length" :options="volumeChartOptions" />  
        </Card>
    </div>
    <div style="margin-top: 20px; display: flex; gap: 20px;">
        <Card style="flex: 1;">
            <div class="stock-dailly-money-title-box">
                <div class="stock-dailly-money-title">大盘成交额</div>
            </div>
            <div class="date-range-box">
				<div class="date-range-label" style="margin-left: 10px;">开始日期</div>
				<DatePicker :model-value="data.amountStartStr"
					type="date" placeholder="Select date" style="width: 200px"
					@on-change="onAmountStartChange"/>
				<div class="date-range-label">结束日期</div>
				<DatePicker :model-value="data.amountEndStr" 
					type="date" placeholder="Select date" style="width: 200px" 
					@on-change="onAmountEndChange" />
			</div>
            <ECharts v-if="amountChartOptions.series.length" :options="amountChartOptions" />  
        </Card>
        <Card style="flex: 1;">
            <div class="stock-dailly-money-title-box">
                <div class="stock-dailly-money-title">两融余额</div>
                <Button @click="onShowModal" size="small" icon="md-create">录入数据</Button>
            </div>
            <div class="date-range-box">
				<div class="date-range-label" style="margin-left: 10px;">开始日期</div>
				<DatePicker :model-value="data.marginTotalBalanceStartStr"
					type="date" placeholder="Select date" style="width: 200px"
					@on-change="onMarginTotalBalanceStartChange"/>
				<div class="date-range-label">结束日期</div>
				<DatePicker :model-value="data.marginTotalBalanceEndStr" 
					type="date" placeholder="Select date" style="width: 200px" 
					@on-change="onMarginTotalBalanceEndChange" />
			</div>
            <ECharts v-if="marginTotalBalanceChartOptions.series.length" :options="marginTotalBalanceChartOptions" />
        </Card>
    </div>
    <Modal
        v-model="data.modalVisible"
        :title="`录入 两融余额 的数据`" :width="600">
        <Form :label-width="100">
            <FormItem label="日期">
                <DatePicker v-model="data.inputDate" type="date" show-week-numbers placeholder="Select date" style="width: 120px" />
                <span style="margin: 0 10px;">两融余额</span>
                <InputNumber :max="100000000" :min="-100000000" :step="1" v-model="data.inputNumber" style="width: 100px"/>
                <span>&nbsp;亿</span>
            </FormItem>
        </Form>
        <template #footer>
            <Button type="text" @click="onCancel">取消</Button>
            <Button type="primary" @click="onOK">确定</Button>
        </template>
    </Modal>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref, computed } from 'vue';
import { Message } from 'view-ui-plus';
import ECharts from '../common/echarts.vue';
import store from '../../../model/store';
import { formatLocalYMD, utcStringToLocalString, getNextDay } from '../../../util/date';
import config from '../../../config/config';

let data = ref({
    updatedAt2: '',
    shiZhiStartDateStr: '2024-09-01', //formatLocalYMD(new Date(new Date().getTime() - 2 * 365 * 24 * 3600 * 1000)), // '2024-09-15'
    shiZhiEndDateStr: formatLocalYMD(new Date()), // 2025-06-12
    volumeStartStr: '2026-01-01',
    volumeEndStr: formatLocalYMD(new Date()), // 2025-06-12
    amountStartStr: '2026-01-01',
    amountEndStr: formatLocalYMD(new Date()), // 2025-06-12
    marginTotalBalanceStartStr: formatLocalYMD(new Date(new Date().getTime() - 365 * 24 * 3600 * 1000)), // '2024-09-15'
    marginTotalBalanceEndStr: formatLocalYMD(new Date()), // 2025-06-12
    modalVisible: false,
	inputDate: new Date(formatLocalYMD(new Date())),
	inputNumber: 0,
});

// 大盘总市值
const shiZhiChartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis',
		// ✅ 开启十字标线（竖+横虚线，y侧显示悬浮y值）
        axisPointer: {
            type: 'cross',
            label:{
                show: true, // Y轴上显示悬浮的y数值标签
                backgroundColor: '#666'
            }
        },
        formatter: function(params) {
			const name = params[0].name;
			const value = Number(params[0].data); // 单位：万亿元
			return `${name}<br/>总市值：${value.toFixed(2)} 万亿`;
		}
	},
	xAxis: {
		type: 'category',
		data: []
	},
	yAxis: {
		type: 'value',
		min: 60, // 固定从 min 万亿开始
		scale: true, // 关键！开启后弱化0基线，适合观察波动
	},
	series: []
});

const volumeChartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis',
        // ✅ 开启十字标线（竖+横虚线，y侧显示悬浮y值）
        axisPointer: {
            type: 'cross',
            label:{
                show: true, // Y轴上显示悬浮的y数值标签
                backgroundColor: '#666'
            }
        },
        formatter: function(params) {
			const name = params[0].name;
			const value = params[0].data.value;
			return `${name}<br/>成交量：${value.toFixed(2)} 亿手`;
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
		min: 5, // 固定从 min 开始
		scale: true, // 关键！开启后弱化0基线，适合观察波动
	},
	series: []
});

const amountChartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis',
		// ✅ 开启十字标线（竖+横虚线，y侧显示悬浮y值）
		axisPointer: {
            type: 'cross',
            label: {
                show: true, // Y轴上显示悬浮的y数值标签
                backgroundColor: '#666'
            }
        },
        formatter: function(params) {
			const name = params[0].name;
			const value = params[0].data.value;
			return `${name}<br/>成交额：${value.toFixed(2)} 万亿`;
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

const marginTotalBalanceChartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis',
		// ✅ 开启十字标线（竖+横虚线，y侧显示悬浮y值）
        axisPointer: {
            type: 'cross',
            label:{
                show: true, // Y轴上显示悬浮的y数值标签
                backgroundColor: '#666'
            }
        },
        formatter: function(params) {
			const name = params[0].name;
			const value = params[0].data.value; // 单位：亿元
			return `${name}<br/>两融余额：${value.toFixed(2)} 万亿`;
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
		min: 2, // 固定从 min 万亿开始
		scale: true, // 关键！开启后弱化0基线，适合观察波动
	},
	series: []
});

onMounted(async () => {
    updateShiZhiChart();
    requestVolumeData();
    requestAmountData();
    requestMarginTotalBalanceData();
});

async function requestDaPanShiZhi() {
	const res = await axios({
		method: 'get',
		url: config.url + '/api/tushare/all_daily_basic'
	});
	store.updateCompositeIndex({
		...res.data.data,
		updatedAt: new Date().toISOString()
	});
	location.reload();
}

function updateShiZhiChart() {
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
	let startStr = data.value.shiZhiStartDateStr;
	let endStr = data.value.shiZhiEndDateStr;

	for (let i = 0; i < indexArr.length; i++) {
		// indexData 为 { '20050620' { amount: 0, count: 0 } }
		let indexData = store.compositeIndex[indexArr[i]];
		let arr = [];
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
			name: '全部',
			type: 'line',
			data: arr.map(item => item.amount / 10000), // 单位 万亿
		});

		if (!allDates) {
			allDates = [];
			for (let i = 0; i < arr.length; i++) {
				allDates.push(arr[i].date);
			}
		}
	}
	shiZhiChartOptions.value.xAxis.data = allDates;
	shiZhiChartOptions.value.series = series;
}

function onShiZhiStartDateChange(dateStr) {
	if (!store.compositeIndex) {
		return;
	}
	data.value.shiZhiStartDateStr = dateStr;
	store.updateCompositeIndex({
		...store.compositeIndex
	});
	if (dateStr >= '2026-01-01') {
		shiZhiChartOptions.value.yAxis.min = 90;
	} else {
		shiZhiChartOptions.value.yAxis.min = 0;
	}
	updateShiZhiChart();
}

function onShiZhiEndDateChange(dateStr) {
	if (!store.compositeIndex) {
		return;
	}
	data.value.shiZhiEndDateStr = dateStr;
	store.updateCompositeIndex({
		...store.compositeIndex
	});
	updateShiZhiChart();
}

async function requestVolumeData() {
    let start = data.value.volumeStartStr;
    let end = data.value.volumeEndStr;
    const res = await axios({
		method: 'get',
		url: config.url + `/api/statistics/daily/amount_volume?start=${start}&end=${end}`
	});
	let resData = res.data.data;

    let series = [
		{
			name: '',
			type: 'line',
			data: resData.list.map(item => {
				return {
					value: item.volume / 10000 / 10000 / 100,
				}
			})
		}
	];

	let dates = resData.list.map(item => item.date);
	volumeChartOptions.value.xAxis.data = dates;
	volumeChartOptions.value.series = series;
}

async function requestAmountData() {
    let start = data.value.amountStartStr;
    let end = data.value.amountEndStr;
    const res = await axios({
		method: 'get',
		url: config.url + `/api/statistics/daily/amount_volume?start=${start}&end=${end}`
	});
	let resData = res.data.data;

    let series = [
		{
			name: '',
			type: 'line',
			data: resData.list.map(item => {
				return {
					value: item.amount / 10000 / 10000,
				}
			})
		}
	];

	let dates = resData.list.map(item => item.date);
	amountChartOptions.value.xAxis.data = dates;
	amountChartOptions.value.series = series;
}

async function requestMarginTotalBalanceData() {
	const res = await axios({
		method: 'get',
		url: config.url + `/api/statistics/daily/amount?type=marginTotalBalance&start=${data.value.marginTotalBalanceStartStr}&end=${data.value.marginTotalBalanceEndStr}`
	});
	let resData = res.data.data;
    let series = [
		{
			name: '两融余额',
			type: 'line',
			data: resData.list.map(item => {
				return {
					value: item.amount / 10000, // 万亿元, 图表绘图使用的值
				}
			})
		}
	];

	let dates = resData.list.map(item => item.date);
	marginTotalBalanceChartOptions.value.xAxis.data = dates;
	marginTotalBalanceChartOptions.value.series = series;
}

function onVolumeStartChange(dateStr) {
    data.value.volumeStartStr = dateStr;
    requestVolumeData();
}

function onVolumeEndChange(dateStr) {
    data.value.volumeEndStr = dateStr;
    requestVolumeData();
}

function onAmountStartChange(dateStr) {
    data.value.amountStartStr = dateStr;
    requestAmountData();
}

function onAmountEndChange(dateStr) {
    data.value.amountEndStr = dateStr;
    requestAmountData();
}

function onShowModal() {
    data.value.modalVisible = true;
	data.value.inputDate = new Date(formatLocalYMD(new Date(new Date().getTime() - 24 * 3600 * 1000)));
    data.value.inputNumber = 0;
}

function onMarginTotalBalanceStartChange(dateStr) {
    data.value.marginTotalBalanceStartStr = dateStr;
    requestMarginTotalBalanceData();
}

function onMarginTotalBalanceEndChange(dateStr) {
    data.value.marginTotalBalanceEndStr = dateStr;
    requestMarginTotalBalanceData();
}

async function onOK() {
    const url = config.url + '/api/statistics/daily/amount';
    let timestamp = data.value.inputDate.getTime();
    timestamp += 8 * 3600 * 1000;
    const res = await axios.post(url, {
		type: 'marginTotalBalance',
        date: new Date(timestamp).toISOString().substring(0, 10),
        amount: data.value.inputNumber
	});
    if (res.data.code === 0) {
		data.value.modalVisible = false;
        Message.success({
            duration: 10,
            content: '录入成功'
        });
		requestMarginTotalBalanceData();
    }
}

function onCancel() {
    data.value.modalVisible = false;
}
</script>

<style lang="css" scoped>
.total-shizhi-txt {
	font-size: 20px;
	font-weight: bold;
	margin-bottom: 5px;
	height: 36px;
	display: flex;
	justify-content: center;  /* 水平居中 */
  	align-items: center;     /* 垂直居中（如果需要） */
}

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