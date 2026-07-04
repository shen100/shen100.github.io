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
                <Input v-model="data.stockInput" placeholder="股票" style="width: 200px; margin-left: 15px" />
                <Button type="primary" @click="onSearch" icon="ios-search" style="margin-left: 15px">搜素</Button>
                <div class="space-all"></div>
                <Button v-if="ifAllowUnion" type="success" @click="onShowUnionStocks" icon="md-sync" style="margin-left: 15px">更新数据</Button>
            </div>
        </Card>
        <div v-if="data.kCharts && data.kCharts.length">
            <KChart :key="i" :ref="el => { if (el) itemRefs[i] = el }" v-for="(kChartData, i) in data.kCharts" 
                :kChartLocalKey="data.kChartLocalKey"
                :addToTrackingEnabled="props.addToTrackingEnabled"
                @add-to-tracking="onAddToTracking" />
        </div>
        <Modal
            v-model="data.addModalVisible"
            title="跟踪K线">
            <div>确定要加入到跟踪K线?</div>
            <template #footer>
                <Button type="text" @click="onAddCancel">取消</Button>
                <Button type="primary" @click="onAddOK">确定</Button>
            </template>
        </Modal>
        <StocksUnionModal 
            :kChartLocalKeyLabel="kChartLocalKeyLabel"
            :unionModalVisible="data.unionModalVisible" 
            :kChartLocalKey="data.kChartLocalKey"
            @hide-modal="onHideUnionStocks"
            @stocks-uion="onStocksUion" />
    </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch, computed } from 'vue';
import KChart from './kchart.vue';
import { formatLocalYMD, parseLocalYMDString } from '../../../util/date';
import { replaceAllSpace, trim } from '../../../util/str';
import StocksUnionModal from './stocks_union_modal.vue';

const emit = defineEmits(['start-change', 'end-change', 'type-change', 'stock-add', 'local-key-change', 'stock-search', 'stocks-uion']);

const itemRefs = ref([]);

const props = defineProps([
    'stocks',
    'type',
    'start',
    'end',
    'addToTrackingEnabled'
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
            value: 'tradePotentialStocks',
            label: '候选股'
        },
        {
            value: 'tradeTrackedStocks',
            label: '股票池'
        },
        {
            value: 'tradeTrackedStocksByStrategy1',
            label: '到达最高价后回踩'
        },
        {
            value: 'tradeTrackedStocksByStrategy2',
            label: '最近 20 天， 80% 的时间处于上涨'
        }
    ],
    type: 'day',
    kCharts: [],
    start: formatLocalYMD(new Date(new Date().getTime() - 180 * 24 * 3600 * 1000)),
    end: formatLocalYMD(new Date()), // 2025-06-12
    addModalVisible: false,
    stockId: '',
    stockFullId: '',
    stockName: '',
    stockInput: '',
    unionModalVisible: false
})

function onLocalKeyChange(key) {
    localStorage.setItem('kChartLocalKey', key)
    emit('local-key-change')
}

onMounted(async () => {
    data.value.kChartLocalKey = localStorage.getItem('kChartLocalKey') || 'tradeTrackedStocks';
    data.value.type = props.type || data.value.type;
    data.value.start = props.start || data.value.start;
    data.value.end = props.end || data.value.end;
    onRequest(props.type);
});

const ifAllowUnion = computed(() => {
    let list = [ 'tradeTrackedStocks', 'tradeTrackedStocksByStrategy1', 'tradeTrackedStocksByStrategy2' ];
    if (list.indexOf(data.value.kChartLocalKey) >= 0) {
        return true;
    }
    return false;
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
        if (newValue && newValue.length === 1) {
            console.log();
        }
        onRequest(data.value.type);
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

function onStartDateChange(dateStr, dateType, type) {
    data.value.start = dateStr;
    onRequest(type);
    emit('start-change', dateStr);
}

function onEndDateChange(dateStr, dateType, type) {
    data.value.end = dateStr;
    onRequest(type);
    emit('end-change', dateStr);
}

function onTypeChange(type) {
    data.value.type = type;
    onRequest(type);
    emit('type-change', type);
}

async function onRequest(type) {
    if (!(props.stocks && props.stocks.length > 0)) {
        return;
    }

    data.value.type = type;
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
    data.value.kCharts = [];
    props.stocks.forEach(stock => {
        data.value.kCharts.push({
            stockId: stock.stockId,
            stockFullId: stock.stockFullId,
            stockName: stock.stockName,
            highPrice: stock.highPrice,
            stopPrice: stock.stopPrice,
            tradeActions: stock.tradeActions,
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

function onAddToTracking(stock) {
    data.value.stockId = stock.stockId;
    data.value.stockFullId = stock.stockFullId;
    data.value.stockName = stock.stockName;
    data.value.addModalVisible = true;
}

function onAddOK() {
    data.value.stockId = replaceAllSpace(data.value.stockId);
    data.value.stockFullId = replaceAllSpace(data.value.stockFullId);
    data.value.stockName = replaceAllSpace(data.value.stockName);
    data.value.addModalVisible = false;
    emit('stock-add', {
        stockId: data.value.stockId,
        stockFullId: data.value.stockFullId,
        stockName: data.value.stockName
    });
    data.value.stockId = '';
    data.value.stockFullId = '';
    data.value.stockName = '';
}

function onAddCancel() {
    data.value.addModalVisible = false;
    data.value.stockId = '';
    data.value.stockFullId = '';
    data.value.stockName = '';
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

function onShowUnionStocks() {
    data.value.unionModalVisible = true;
}

function onHideUnionStocks() {
    data.value.unionModalVisible = false;
}

function onStocksUion() {
    data.value.unionModalVisible = false;
    emit('stocks-uion');
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
</style>
