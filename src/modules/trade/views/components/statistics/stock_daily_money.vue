<template>
    <div style="margin-top: 20px; display: flex; gap: 20px;">
        <Card style="flex: 1;">
            <div class="stock-dailly-money-title-box">
                <div class="stock-dailly-money-title">成交额</div>
                <Button @click="onShowModal('amount')" size="small" icon="md-create">录入数据</Button>
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
                <Button @click="onShowModal('marginTotalBalance')" size="small" icon="md-create">录入数据</Button>
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

        <Modal
            v-model="data.modalVisible"
            :title="`录入 ${modalTitle} 的数据`" :width="600">
            <Form :label-width="100">
                <FormItem label="日期">
                    <DatePicker v-model="data.inputDate" type="date" show-week-numbers placeholder="Select date" style="width: 120px" />
                    <span style="margin: 0 10px;">{{modalTitle}}</span>
                    <InputNumber :max="100000000" :min="-100000000" :step="1" v-model="data.inputNumber" style="width: 100px"/>
                    <span>&nbsp;亿</span>
                </FormItem>
            </Form>
            <template #footer>
                <Button type="text" @click="onCancel">取消</Button>
                <Button type="primary" @click="onOK">确定</Button>
            </template>
        </Modal>
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref, computed } from 'vue';
import { Message } from 'view-ui-plus';
import ECharts from '../common/echarts.vue';
import { formatLocalYMD } from '../../../util/date';
import config from '../../../config/config';

let data = ref({
    inputDate: new Date(formatLocalYMD(new Date())),
    inputNumber: 0,
	amountStartStr: formatLocalYMD(new Date(new Date().getTime() - 365 * 24 * 3600 * 1000)), // '2024-09-15'
    amountEndStr: formatLocalYMD(new Date()), // 2025-06-12
    marginTotalBalanceStartStr: formatLocalYMD(new Date(new Date().getTime() - 365 * 24 * 3600 * 1000)), // '2024-09-15'
    marginTotalBalanceEndStr: formatLocalYMD(new Date()), // 2025-06-12
    modalVisible: false,
    selectedType: ''
});

const amountChartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis',
        formatter: function(params) {
			const name = params[0].name;
			const value = params[0].data.value; // 单位：亿元
			let displayValue;
			let unit = '亿元';
			if (value >= 10000) {
				displayValue = (value / 10000).toFixed(2);
				unit = '万亿';
			} else {
				displayValue = value.toFixed(0);
				unit = '亿';
			}
			return `${name}<br/>成交额：${displayValue} ${unit}`;
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
		min: 10000, // 固定从 1 万亿开始
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
        formatter: function(params) {
			const name = params[0].name;
			const value = params[0].data.value; // 单位：亿元
			let displayValue;
			let unit = '亿元';
			if (value >= 10000) {
				displayValue = (value / 10000).toFixed(2);
				unit = '万亿';
			} else {
				displayValue = value.toFixed(0);
				unit = '亿';
			}
			return `${name}<br/>两融余额：${displayValue} ${unit}`;
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
		min: 22000, // 固定从 2.2 万亿开始
		scale: true, // 关键！开启后弱化0基线，适合观察波动
	},
	series: []
});

const modalTitle = computed(() => {
    if (data.value.selectedType === 'amount') {
        return '成交额';
    } else if (data.value.selectedType === 'marginTotalBalance') {
        return '两融余额';
    }
    return '';
});

onMounted(async () => {
    requestAmountData();
    requestMarginTotalBalanceData();
});

function onShowModal(selectedType) {
    data.value.selectedType = selectedType;
    data.value.modalVisible = true;
    data.value.inputDate = new Date(formatLocalYMD(new Date()));
    // data.value.inputDate = new Date(data.value.inputDate.getTime() + 24 * 3600 * 1000)
    data.value.inputNumber = 0;
}

async function requestAmountData() {
	const res = await axios({
		method: 'get',
		url: config.url + `/api/statistics/daily/amount?type=amount&start=${data.value.amountStartStr}&end=${data.value.amountEndStr}`
	});
	let resData = res.data.data;

    let series = [
		{
			name: '成交额',
			type: 'line',
			data: resData.list.map(item => {
				return {
					value: item.amount, // 亿元, 图表绘图使用的值
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
					value: item.amount, // 亿元, 图表绘图使用的值
				}
			})
		}
	];

	let dates = resData.list.map(item => item.date);
	marginTotalBalanceChartOptions.value.xAxis.data = dates;
	marginTotalBalanceChartOptions.value.series = series;
}

async function onOK() {
    const url = config.url + '/api/statistics/daily/amount';
    let timestamp = data.value.inputDate.getTime();
    timestamp += 8 * 3600 * 1000;
    const res = await axios.post(url, {
		type: data.value.selectedType,
        date: new Date(timestamp).toISOString().substring(0, 10),
        amount: data.value.inputNumber
	});
    if (res.data.code === 0) {
        Message.success({
            duration: 10,
            content: '录入成功'
        });
		if (data.value.selectedType === 'amount') {
			requestAmountData();
		} else if (data.value.selectedType === 'marginTotalBalance') {
			requestMarginTotalBalanceData();
		}
    }
}

function onCancel() {
    data.value.modalVisible = false;
}

function onAmountStartChange(dateStr) {
	data.value.amountStartStr = dateStr;
    requestAmountData();
}

function onAmountEndChange(dateStr) {
	data.value.amountEndStr = dateStr;
    requestAmountData();
}

function onMarginTotalBalanceStartChange(dateStr) {
    data.value.marginTotalBalanceStartStr = dateStr;
    requestMarginTotalBalanceData();
}

function onMarginTotalBalanceEndChange(dateStr) {
    data.value.marginTotalBalanceEndStr = dateStr;
    requestMarginTotalBalanceData();
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