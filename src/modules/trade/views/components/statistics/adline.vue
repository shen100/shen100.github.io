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

        </Card>
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref, computed } from 'vue';
import ECharts from '../common/echarts.vue';
import { formatLocalYMD } from '../../../util/date';
import config from '../../../config/config';

let data = ref({
	adLineStartStr: formatLocalYMD(new Date(new Date().getTime() - 365 * 24 * 3600 * 1000)), // '2024-09-15'
    adLineEndStr: formatLocalYMD(new Date()), // 2025-06-12
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
		min: -60000, // 固定从 min 开始
		scale: true, // 关键！开启后弱化0基线，适合观察波动
	},
	series: []
});

onMounted(async () => {
    requestAdLineData();
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

function onAdLineStartChange(dateStr) {
	data.value.adLineStartStr = dateStr;
    requestAdLineData();
}

function onAdLineEndChange(dateStr) {
	data.value.adLineEndStr = dateStr;
    requestAdLineData();
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