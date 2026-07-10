<template>
    <div>
        <Card class="kcharts-type-card">
            <div style="display: flex;">
                <Select v-model="data.kChartLocalKey" @on-change="onLocalKeyChange" style="width: 300px">
                    <Option v-for="item in data.localKeys" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
                <div class="date-label" style="margin-left: 10px;">开始日期</div>
                <DatePicker :model-value="data.start"
                    type="date" placeholder="Select date" style="width: 200px"
                    @on-change="(dateStr, dateType) => onStartDateChange(dateStr, dateType, data.type)"/>
                <div class="date-label date-label-end">结束日期</div>
                <DatePicker :model-value="data.end" 
                    type="date" placeholder="Select date" style="width: 200px" 
                    @on-change="(dateStr, dateType) => onEndDateChange(dateStr, dateType, data.type)" />
                <ButtonGroup class="button-group">
                    <Button @click="onTypeChange('day')" :type="data.type === 'day' ? 'primary' : 'default'">天</Button>
                    <Button @click="onTypeChange('week')" :type="data.type === 'week' ? 'primary' : 'default'">周</Button>
                    <Button @click="onTypeChange('month')" :type="data.type === 'month' ? 'primary' : 'default'">月</Button>
                    <Button @click="onTypeChange('year')" :type="data.type === 'year' ? 'primary' : 'default'">年</Button>
                </ButtonGroup>
                <Input v-model="data.stockInput" @on-clear="onClearStockInput" clearable placeholder="股票" style="width: 200px; margin-left: 15px" />
                <Button type="primary" @click="onSearch" icon="ios-search" style="margin-left: 15px">搜素</Button>
                <div class="new-price-box">
                    <Checkbox v-model="data.isNewPriceMode" @on-change="isNewPriceModeChange">只看最新涨幅</Checkbox>
                </div>
                <div class="space-all"></div>
                <Button v-if="ifAllowUnion" type="success" @click="onShowUnionStocks" icon="md-sync" style="margin-left: 15px">更新数据</Button>
            </div>
        </Card>
        <div v-if="data.kCharts && data.kCharts.length">
            <KChart :key="i" :ref="el => { if (el) itemRefs[i] = el }" v-for="(kChartData, i) in data.kCharts" 
                @stocks-remove-potential="onStocksRemovePotential" 
                @audit-trail-change="onAuditTrailChange"
                :kChartLocalKey="data.kChartLocalKey"
                :isNewPriceMode="data.isNewPriceMode" />
        </div>
        <StocksUnionModal 
            :kChartLocalKeyLabel="kChartLocalKeyLabel"
            :modalVisible="data.unionModalVisible" 
            :kChartLocalKey="data.kChartLocalKey"
            @hide-modal="onHideUnionStocks"
            @stocks-union="onStocksUion" />
    </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch, computed } from 'vue';
import KChart from './kchart.vue';
import { formatLocalYMD, parseLocalYMDString } from '../../../util/date';
import { replaceAllSpace, trim } from '../../../util/str';
import StocksUnionModal from './stocks_union_modal.vue';

const emit = defineEmits([
    'start-change', 
    'end-change', 
    'type-change', 
    'local-key-change', 
    'stock-search', 
    'stocks-union',
    'stocks-remove-potential'
]);

const itemRefs = ref([]);

const props = defineProps([
    'stocks',
    'type',
    'start',
    'end',
    'filterData'
]);

let data = ref({
    kChartLocalKey: '',
    localKeys: [
        {
            value: 'tradeAllFullIdStocks',
            label: '全部股票'
        },
        {
            value: 'tradeInvestedStocks',
            label: '当前持仓'
        },
        {
            value: 'tradeTrail',
            label: '交易回溯'
        },
        {
            value: 'tradePotentialStocks',
            label: '候选股'
        },
        {
            value: 'tradeMemoryStocks',
            label: '存储'
        },
        {
            value: 'tradePhysicalAIStocks',
            label: '物理AI'
        },
        {
            value: 'tradeStocksByStrategy1',
            label: '到达最高价后回踩'
        },
        {
            value: 'tradeStocksByStrategy2',
            label: '最后一个交易日达到最高价'
        }
    ],
    type: 'day',
    kCharts: [],
    start: formatLocalYMD(new Date(new Date().getTime() - 180 * 24 * 3600 * 1000)),
    end: formatLocalYMD(new Date()), // 2025-06-12
    stockId: '',
    stockFullId: '',
    stockName: '',
    stockInput: '',
    unionModalVisible: false,
    isNewPriceMode: false
})

function onLocalKeyChange(key) {
    localStorage.setItem('tradeKChartLocalKey', key)
    emit('local-key-change')
}

onMounted(async () => {
    for (let i = data.value.localKeys.length - 1; i >= 0; i--) {
        if (data.value.localKeys[i].value === 'tradeTrail') {
            data.value.localKeys.splice(i, 1);
            break;
        }
    }
    nextTick(() => {
        data.value.kChartLocalKey = localStorage.getItem('tradeKChartLocalKey');
        data.value.type = props.type || data.value.type;
        data.value.start = props.start || data.value.start;
        data.value.end = props.end || data.value.end;
        onRequest(props.type, props.stocks);
    })
});

const ifAllowUnion = computed(() => {
    let list = [ 'tradeStocksByStrategy1', 'tradeStocksByStrategy2' ];
    return list.indexOf(data.value.kChartLocalKey) >= 0;
});

const kChartLocalKeyLabel = computed(() => {
	for (let i = 0; i < data.value.localKeys.length; i++) {
        if (data.value.localKeys[i].value === data.value.kChartLocalKey) {
            return data.value.localKeys[i].label;
        }
    }
	return ''
})

watch(
    () => props.stocks,
    (newValue, oldValue) => {
        onRequest(data.value.type, newValue);
    }
)

watch(
    () => props.type,
    (newValue, oldValue) => {
        data.value.type = newValue;
    }
)

watch(
    () => props.start,
    (newValue, oldValue) => {
        data.value.start = newValue;
    }
)

watch(
    () => props.end,
    (newValue, oldValue) => {
        data.value.end = newValue;
    }
)

watch(() => props.filterData?.stockInput, (newVal) => {
    data.value.stockInput = newVal || ''
})

function onStartDateChange(dateStr, dateType, type) {
    data.value.start = dateStr;
    onRequest(type, props.stocks);
    emit('start-change', dateStr);
}

function onEndDateChange(dateStr, dateType, type) {
    data.value.end = dateStr;
    onRequest(type, props.stocks);
    emit('end-change', dateStr);
}

function onTypeChange(type) {
    data.value.type = type;
    onRequest(type, props.stocks);
    emit('type-change', type);
}

async function onRequest(type, stocks) {
    data.value.type = type;
    data.value.kCharts = [];

    if (!(stocks && stocks.length > 0)) {
        return;
    }

    let startStr = data.value.start; // 2025-06-12
    let endStr = data.value.end;
	let startDate = parseLocalYMDString(startStr);
    let endDate = parseLocalYMDString(endStr);

	let count;
	
    if (type === "day") {
        count = Math.floor((endDate - startDate) / (24 * 3600 * 1000));
    } else if (type === "week") {
        count = Math.floor((endDate - startDate) / (7 * 24 * 3600 * 1000));
    } else if (type === "month") {
        count = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    } else if (type === "year") {
		count = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    }
    
    stocks.forEach(stock => {
        data.value.kCharts.push({
            stockId: stock.stockId,
            stockFullId: stock.stockFullId,
            stockName: stock.stockName,
            highPrice: stock.highPrice,
            stopPrice: stock.stopPrice,
            isStar: !!stock.isStar,
            tradeActions: stock.tradeActions,
            trailData: stock.trailData
        });
    });

    await nextTick();

	itemRefs.value.forEach((el, index) => {
        if (el) {
            let stock = data.value.kCharts[index];
            // 每页 20 个，假如最后一页小于 20 个，翻到最后一页时，itemRefs 这时仍旧是 20 个，没有及时销毁
            // 此时 用 index 从 kCharts 里取 stock，就为空
            if (!stock) {
                return;
            }
            let requestType = data.value.type;
            if (requestType == "day") {
                el.requestDayK(stock, startStr, endStr, count);
            } else if (requestType == "week") {
                el.requestWeekK(stock, startStr, endStr, count);
            } else if (requestType == "month") {
                el.requestMonthK(stock, startStr, endStr, count);
            } else if (requestType == "year") {
                el.requestYearK(stock, startStr, endStr, count);
            }
        }
    });
}

function onSearch() {
    let filterData = null;
    let stockInput = trim(data.value.stockInput || '');
    if (stockInput.length > 0) {
        filterData = {
            stockInput
        }
    }
    emit('stock-search', filterData);
}

function onClearStockInput() {
    emit('stock-search', null);
}

function onShowUnionStocks() {
    data.value.unionModalVisible = true;
}

function onHideUnionStocks() {
    data.value.unionModalVisible = false;
}

function onStocksUion() {
    data.value.unionModalVisible = false;
    emit('stocks-union');
}

function onStocksRemovePotential() {
	emit('stocks-remove-potential');
}

function onAuditTrailChange(stockId, trailData) {
    let str = localStorage.getItem(data.value.kChartLocalKey) || '[]';
    let stocks = JSON.parse(str);
    for (let i = 0; i < stocks.length; i++) {
        if (stocks[i].stockId === stockId) {
            stocks[i].trailData = trailData;
            localStorage.setItem(data.value.kChartLocalKey, JSON.stringify(stocks, null, 4));
            location.reload();
            break;
        }
    }
}

async function isNewPriceModeChange(value) {
    let stocks = props.stocks.slice();
    if (value) {
        let dtRateMap = {};
        itemRefs.value.forEach((el, index) => {
            if (el) {
                let stock = data.value.kCharts[index];
                if (!stock) {
                    return;
                }
                dtRateMap[stock.stockId] = {
                    dtRate: el.getDtRate()
                };
            }
        });
        stocks.sort((a, b) => {
            return dtRateMap[a.stockId].dtRate > dtRateMap[b.stockId].dtRate ? -1 : 1;
        });
    }
    onRequest(data.value.type, stocks);
}
</script>

<style scoped>
.kcharts-type-card {
    margin-bottom: 20px;
}

.date-label {
    margin-right: 10px;
    line-height: 32px;
}

.date-label-end {
    margin-left: 10px;
}

.button-group {
    margin-left: 10px;
}

.space-all {
    flex: 1;
}

.new-price-box {
    display: inline-block;
    vertical-align: top;
    line-height: 32px;
    margin-left: 10px;
}
</style>
