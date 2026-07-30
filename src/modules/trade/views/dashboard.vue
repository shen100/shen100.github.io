<template>
    <div>
		<div style="display: flex; gap: 20px; margin-bottom: 20px;">
			<Card style="flex: 1">
				<ECharts v-if="shiZhiCountPiChartOptions.series.length" @click="onShiZhiPieChartClick" :options="shiZhiCountPiChartOptions" />
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
					<div style="margin-right: 4px;">每日涨跌数</div>
				</div>
				<ECharts v-if="dailySurgePlungeChartOptions.series.length" @click="onDailyUpChartClick" :options="dailySurgePlungeChartOptions" />
			</Card>
			<Card style="flex: 1;">
				<div class="total-shizhi-txt">
					<div style="margin-right: 4px;">资金流向(单位亿)</div>
				</div>
				<div style="text-align: center; margin-bottom: 20px;">
					<div class="concept-label">概念板块</div>
					<Select v-model="data.selectedConcept" @on-change="onConceptChange" style="width: 200px; margin-right: 10px; text-align: left;">
						<Option v-for="item in data.concepts" :value="item" :key="item">{{ item }}</Option>
					</Select>
					<Button :disabled="!data.selectedConcept" type="primary" @click="gotoCustomStocksKLine">查看K线</Button>
				</div>
				<ECharts v-if="dailyMoneyFlowChartOptions.series.length" :options="dailyMoneyFlowChartOptions" />
			</Card>
		</div>
		<div class="daily-up-list">
			<Card v-for="(item, i) in dailyUpCountList" :key="i" class="daily-up-item">
				<div class="total-shizhi-txt">
					<div style="margin-right: 4px;">每日上涨股票数(和前{{ item.dayCount }}个交易日每天的股价相比)</div>
					<Tooltip content="假如股票A在7月27日的收盘价是100, 那和前十天每天的收盘价相比，100都是最大值的话，那么就把7月27日的上涨股票数加 1"
						:max-width="300" placement="top">
						<Icon type="ios-alert" />
					</Tooltip>
				</div>
				<ECharts v-if="item.series.length" @click="params => onDailyUpChartClick(i, params)" :options="item" />
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
	compositeIndex: null, // 综合指数
	updatedAt2: '',
	shiZhiStartDateStr: formatLocalYMD(new Date(new Date().getTime() - 2 * 365 * 24 * 3600 * 1000)), // '2024-09-15'
    shiZhiEndDateStr: formatLocalYMD(new Date()), // 2025-06-12
	concepts: [],
	selectedConcept: ''
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

function getDailyUpCountChartInitData(dayCount) {
	return {
		dayCount,
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
	};
}

const dailyUpCountList = ref([
	getDailyUpCountChartInitData(10),
	getDailyUpCountChartInitData(22),
	getDailyUpCountChartInitData(44),
	getDailyUpCountChartInitData(250),
])

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

let allDailyMoneyFlowList = [];

const dailySurgePlungeChartOptions = ref({
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
	requestAllStockDetail();
	updateShiZhiPiChart();
	updateChart();
	requestAllDailyUpCount();
	requestDailyMoneyFlow();
	requestDailySurgePlunge();
});

function updateShiZhiPiChart(resData) {
	if (!resData) {
		let resDataStr = localStorage.getItem('tradeStockMarketStats') || 'null';
		resData = JSON.parse(resDataStr);
	}
	if (!resData) {
		return;
	}
	let arr = [];
	let arr2 = [];
	for (let i = 0; i < resData.shiZhiList.length; i++) {
		let item = resData.shiZhiList[i];
		arr.push({ value: item.count, name: item.name, selectIndex: i + '', minValue: item.minValue, maxValue: item.maxValue });
		arr2.push({ value: item.amount, name: item.name, selectIndex: i + '', minValue: item.minValue, maxValue: item.maxValue });
	}
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
		...res.data.data,
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

function onShiZhiPieChartClick(params) {
	const chartData = params.data;
	let query = {
		selectShiZhiIndex: chartData.selectIndex,
		minValue: chartData.minValue,
		maxValue: chartData.maxValue,
	};
	router.push({ path: `/trade/tracked_kcharts`, query });
}

async function requestAllDailyUpCount(params) {
	Promise.all([
		requestDailyUpCount(0, 10),
		requestDailyUpCount(1, 22),
		requestDailyUpCount(2, 44),
		requestDailyUpCount(3, 250),
	])
}

async function requestDailyUpCount(index, dayCount) {
	const res = await axios({
		method: 'get',
		url: 'http://localhost:3000/api/statistics/daily/up/' + dayCount
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
		data: list.map(item => {
			return {
				value: item.count, // 图表绘图使用的值
            	...item // 把原始所有字段放进来
			}
		})
	});
	const dailyUpCountChartOptions = dailyUpCountList.value[index]; //  JSON.parse(JSON.stringify(dailyUpCountList.value[index]));
	dailyUpCountChartOptions.xAxis.data = dates;
	dailyUpCountChartOptions.series = series;
	dailyUpCountList.value.splice(index, 1, dailyUpCountChartOptions);
}

async function onDailyUpChartClick(index, params) {
	console.log(params);
	if (params.componentType === 'series' && params.seriesType === 'line') {
		const dailyUpCountChartOptions = dailyUpCountList.value[index];
		const serie = dailyUpCountChartOptions.series[params.seriesIndex];
		const item = serie.data[params.dataIndex];
		console.log(item);

		let url = 'http://localhost:3000/api/stocks/get_stocks_by_fullids';
		const res = await axios.post(url, {
			stockFullIds: item.stocks,
		});
		if (!(res.data.code === 0 && res.data.data)) {
			Message.error({
				duration: 10,
				content: `请求接口失败`
			});
			return
		}
		let gotoUrl = `/trade/tracked_kcharts?uuid=${res.data.data.uuid}`
		window.open(gotoUrl, '_blank');
	}
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
	allDailyMoneyFlowList = list;

	data.value.concepts = res.data.data.names;
	setCurrentDailyMoneyFlow(0);
}

function setCurrentDailyMoneyFlow(index) {
	let series = [
		{
			name: allDailyMoneyFlowList[index].name,
			type: 'line',
			data: allDailyMoneyFlowList[index].dates.map(item => (item.amount / 10000).toFixed(2))
		}
	];

	let dates = allDailyMoneyFlowList[index].dates.map(item => item.date);

	dailyMoneyFlowChartOptions.value.legend.data = [ allDailyMoneyFlowList[index].name ];
	dailyMoneyFlowChartOptions.value.xAxis.data = dates;
	dailyMoneyFlowChartOptions.value.series = series;
	data.value.selectedConcept = allDailyMoneyFlowList[index].name;
}

function onConceptChange(value) {
	console.log(value);
	for (let i = 0; i < allDailyMoneyFlowList.length; i++) {
		if (allDailyMoneyFlowList[i].name === value) {
			setCurrentDailyMoneyFlow(i);
			break;
		}
	}
}

async function requestDailySurgePlunge() {
	const res = await axios({
		method: 'get',
		url: 'http://localhost:3000/api/statistics/daily/surge_plunge'
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
	let incArr = [];
	let subArr = [];
	let dates = [];
	list.forEach(item => {
		incArr.push(item.incCount);
		subArr.push(item.subCount);
		dates.push(item.date);
	});
	series.push({
		name: '上涨数',
		type: 'line',
		data: incArr
	});
	series.push({
		name: '下跌数',
		type: 'line',
		data: subArr
	});
	dailySurgePlungeChartOptions.value.legend.data = [ '上涨数', '下跌数' ];
	dailySurgePlungeChartOptions.value.xAxis.data = dates;
	dailySurgePlungeChartOptions.value.series = series;
}

async function gotoCustomStocksKLine() {
	let url = 'http://localhost:3000/api/statistics/concept/get_stocks?concept=' + encodeURIComponent(data.value.selectedConcept);
	const res = await axios({
		method: 'get',
		url
	});
	if (!(res.data.code === 0 && res.data.data)) {
		Message.error({
			duration: 10,
			content: `请求接口失败, /api/statistics/concept/get_stocks`
		});
		return
	}
	const uuid = res.data.data.uuid;
	let gotoUrl = `/trade/tracked_kcharts?uuid=${uuid}`
	window.open(gotoUrl, '_blank');
}
</script>

<style scoped>
.total-shizhi-txt {
	font-size: 20px;
	font-weight: bold;
	margin-bottom: 5px;
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

.concept-label {
	display: inline-block;
	vertical-align: top;
	margin-right: 10px;
	line-height: 32px;
}

.daily-up-list {
	margin-top: 20px;
	display: flex;
  	flex-wrap: wrap;
  	gap: 20px; /* 间距 */
}

.daily-up-item {
  /* 两列：减去gap，均分宽度 */
  width: calc(50% - 10px);
}
</style>
