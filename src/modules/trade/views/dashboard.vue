<template>
    <div>
		<div style="display: flex; gap: 20px; margin-bottom: 20px;">
			<Card style="flex: 1">
				<ECharts v-if="shiZhiCountPiChartOptions.series.length" @click="onShiZhiPieChartClick" :options="shiZhiCountPiChartOptions" />
				<div style="display: flex;align-items: center; justify-content: right;">
					<Icon class="refresh" @click="requestAllStockDetail" type="md-refresh" style="cursor: pointer;" />
					<div class="updated-at">{{ data.updatedAt1 ? '更新于 ' + data.updatedAt1 : '' }}</div>
				</div>
			</Card>
			<Card style="flex: 1">
				<ECharts v-if="shiZhiAmountPiChartOptions.series.length" @click="onShiZhiPieChartClick" :options="shiZhiAmountPiChartOptions" />	
			</Card>
		</div>
		<Card style="margin: 20px 0;">
			<div class="total-shizhi-txt">
				<div>大盘总市值(单位: 万亿)</div>
				<Icon class="refresh" @click="requestAllDailyBasic" type="md-refresh" style="cursor: pointer;" />
				<div class="updated-at">{{ data.updatedAt2 ? '更新于 ' + data.updatedAt2 : '' }}</div>
			</div>
			<div class="shizhi-date-box">
				<div class="date-label" style="margin-left: 10px;">开始日期</div>
				<DatePicker :model-value="data.shiZhiStartDateStr"
					type="date" placeholder="Select date" style="width: 200px"
					@on-change="onShiZhiStartDateChange"/>
				<div class="date-label date-label-end">结束日期</div>
				<DatePicker :model-value="data.shiZhiEndDateStr" 
					type="date" placeholder="Select date" style="width: 200px" 
					@on-change="onShiZhiEndDateChange" />
			</div>
			<ECharts v-if="chartOptions.series.length" :options="chartOptions" />
		</Card>
		<div style="margin-top: 20px; display: flex; gap: 20px;">
			<Card style="flex: 1;">
				<div class="total-shizhi-txt">
					<div style="margin-right: 4px;">每日上涨股票数(和前十天每天的股价相比)</div>
					<Tooltip content="假如股票A在7月27日的收盘价是100, 那和前十天每天的收盘价相比，100都是最大值的话，那么就把7月27日的上涨股票数加 1"
						:max-width="300" placement="top">
						<Icon type="ios-alert" />
					</Tooltip>
				</div>
				<ECharts v-if="dailyUpCountChartOptions.series.length" :options="dailyUpCountChartOptions" />
			</Card>
			<Card style="flex: 1;">
				<div class="total-shizhi-txt">
					<div style="margin-right: 4px;">资金流向</div>
				</div>
				<ECharts v-if="dailyMoneyFlowChartOptions.series.length" :options="dailyMoneyFlowChartOptions" />
			</Card>
		</div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { Message } from 'view-ui-plus';
import ECharts from './components/common/echarts.vue'
import store from '../model/store';
import { formatLocalYMD, utcStringToLocalString } from '../util/date';
import { useRouter } from 'vue-router';

const router = useRouter()

let data = ref({
	updatedAt1: '',
	compositeIndex: null, // 综合指数
	updatedAt2: '',
	shiZhiStartDateStr: formatLocalYMD(new Date(new Date().getTime() - 3 * 365 * 24 * 3600 * 1000)), // '2024-09-15'
    shiZhiEndDateStr: formatLocalYMD(new Date()), // 2025-06-12
});

const shiZhiCountPiChartOptions = ref({
  title: {
    text: '公司分布(按公司数)',
	subtext: '',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
	formatter: '{b}<br/>公司数：{c}<br/>百分比：{d}%'
  },
  series: [
    {
      type: 'pie',
      radius: '50%',
      data: [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
});

const shiZhiAmountPiChartOptions = ref({
  title: {
    text: '公司分布(按总市值)',
	subtext: '',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
	// formatter: '{b}<br/>总市值：{c}<br/>百分比：{d}%'
	formatter: function(params) {
		// params 包含 name, value, percent 等
		const name = params.name;
		const value = params.value; // 单位：亿元
		// 转为万亿（如果数值 >= 10000 亿）
		let displayValue;
		let unit = '亿元';
		if (value >= 10000) {
			displayValue = (value / 10000).toFixed(1); // 保留一位小数
			unit = '万亿';
		} else {
			displayValue = value.toFixed(0);
			unit = '亿';
		}
		// 百分比使用 params.percent，自带 %
    return `${name}<br/>总市值：${displayValue} ${unit}<br/>百分比：${params.percent}%`;
  }
  },
  series: [
    {
      type: 'pie',
      radius: '50%',
      data: [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
});

let legendData = [
	'全部', '小于100亿', '[100亿, 500亿)', '[500亿, 1000亿)', '[1000亿, 2000亿)', '[2000亿, 5000亿)', '[5000亿, 1万亿)', '1万亿以上'
];

const chartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis'
	},
	// legend: {
	// 	data: legendData
	// },
	xAxis: {
		type: 'category',
		data: []
	},
	yAxis: {
		type: 'value'
	},
	series: []
});

const dailyUpCountChartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis'
	},
	// legend: {
	// 	data: legendData
	// },
	xAxis: {
		type: 'category',
		data: []
	},
	yAxis: {
		type: 'value'
	},
	series: []
});

const dailyMoneyFlowChartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis'
	},
	legend: {
		data: []
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
	updateShiZhiPiChart();
	updateChart();
	requestDailyUpCount();
	requestDailyMoneyFlow();
});

function updateShiZhiPiChart(resData) {
	if (!resData) {
		let resDataStr = localStorage.getItem('tradeStockMarketStats') || 'null';
		resData = JSON.parse(resDataStr);
	}
	if (!resData) {
		return;
	}
	data.value.updatedAt1 = utcStringToLocalString(resData.updatedAt);
	let arr = [];
	let arr2 = [];
	for (let i = 0; i < resData.shiZhiList.length; i++) {
		let item = resData.shiZhiList[i];
		arr.push({ value: item.count, name: item.name, selectIndex: i + '', minValue: item.minValue, maxValue: item.maxValue });
		arr2.push({ value: item.amount, name: item.name, selectIndex: i + '', minValue: item.minValue, maxValue: item.maxValue });
	}
	console.log(arr);
	shiZhiCountPiChartOptions.value.title.subtext = '总市值 ' + (resData.shiZhiData.amount / 10000).toFixed(2) + '万亿';
	shiZhiCountPiChartOptions.value.series[0].data = arr;

	shiZhiAmountPiChartOptions.value.title.subtext = '总市值 ' + (resData.shiZhiData.amount / 10000).toFixed(2) + '万亿';
	shiZhiAmountPiChartOptions.value.series[0].data = arr2;
}

function updateChart() {
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
	for (let i = 0; i < indexArr.length; i++) {
		// indexData 为 { '20050620' { amount: 0, count: 0 } }
		let indexData = store.compositeIndex[indexArr[i]];
		let arr = [];
		let startStr = data.value.shiZhiStartDateStr.replaceAll('-', '');
		let endStr = data.value.shiZhiEndDateStr.replaceAll('-', '');
		console.log('startStr ->', startStr);
		console.log('endStr ->', endStr);
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
			name: legendData[i],
			type: 'line',
			data: arr.map(item => Number(item.amount / 10000).toFixed(2)), // 转换为万亿
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
}

async function requestAllStockDetail() {
	const res = await axios({
		method: 'get',
		url: 'http://127.0.0.1:3000/api/statistics/shizhi'
	});
	if (!(res.data.code === 0 && res.data.data)) {
		Message.error({
			duration: 10,
			content: `大盘市值更新失败`
		});
		return
	}
	let resData = res.data.data;
	resData.updatedAt = new Date().toISOString();

	updateShiZhiPiChart(resData);

	delete resData.stocks;

	localStorage.setItem('tradeStockMarketStats', JSON.stringify(resData));

	console.log('requestAllStockDetail done');
}

async function requestAllDailyBasic() {
	const res = await axios({
		method: 'get',
		url: 'http://127.0.0.1:3000/api/tushare/all_daily_basic'
	});
	if (!(res.data.code === 0 && res.data.data)) {
		Message.error({
			duration: 10,
			content: `大盘市值更新失败`
		});
		return
	}
	store.updateCompositeIndex({
		...res.data.data.compositeIndex,
		updatedAt: new Date().toISOString()
	});
	location.reload();
}

function onShiZhiStartDateChange(dateStr) {
	if (!store.compositeIndex) {
		return;
	}
	data.value.shiZhiStartDateStr = dateStr;
	store.updateCompositeIndex({
		...store.compositeIndex
	});
	updateChart();
}

function onShiZhiEndDateChange(dateStr) {
	if (!store.compositeIndex) {
		return;
	}
	data.value.shiZhiEndDateStr = dateStr;
	store.updateCompositeIndex({
		...store.compositeIndex
	});
	updateChart();
}

function onShiZhiPieChartClick(chartData) {
	console.log('onShiZhiPieChartClick', chartData);
	let query = {
		selectShiZhiIndex: chartData.selectIndex,
		minValue: chartData.minValue,
		maxValue: chartData.maxValue,
	};
	console.log('query', query);
	router.push({ path: `/trade/tracked_kcharts`, query });
}

async function requestDailyUpCount() {
	const res = await axios({
		method: 'get',
		url: 'http://localhost:3000/api/statistics/daily/up'
	});
	if (!(res.data.code === 0 && res.data.data)) {
		Message.error({
			duration: 10,
			content: `请求接口失败, /api/statistics/daily/up`
		});
		return
	}
	let list = res.data.data.list;

	let series = [];

	let dates = list.map(item => item.date)
	series.push({
		type: 'line',
		data: list.map(item => item.count)
	});
	dailyUpCountChartOptions.value.xAxis.data = dates;
	dailyUpCountChartOptions.value.series = series;
}

async function requestDailyMoneyFlow() {
	const res = await axios({
		method: 'get',
		url: 'http://localhost:3000/api/statistics/daily/money_flow'
	});
	if (!(res.data.code === 0 && res.data.data)) {
		Message.error({
			duration: 10,
			content: `请求接口失败, /api/statistics/daily/money_flow`
		});
		return
	}
	let list = res.data.data.list;

	let series = [];

	let dates = list[0].dates.map(item => item.date);

	for (let i = 0; i < list.length; i++) {
		series.push({
			name: list[i].name,
			type: 'line',
			data: list[i].dates.map(item => (item.amount / 10000).toFixed(2))
		});
	}
	dailyMoneyFlowChartOptions.value.legend.data = res.data.data.names;
	dailyMoneyFlowChartOptions.value.xAxis.data = dates;
	dailyMoneyFlowChartOptions.value.series = series;
	console.log(dailyMoneyFlowChartOptions.value);
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

.goto-kcharts {
	cursor: pointer;
}

.goto-kcharts:hover {
	color: #409eff;
}

.shizhi-date-box {
	display: flex;
    align-items: center;
    justify-content: center;
}

.date-label {
    margin-right: 10px;
    line-height: 32px;
}

.date-label-end {
    margin-left: 10px;
}
</style>
