<template>
    <div>
        <Card style="margin-bottom: 20px;">
            <span class="profit-total-title">总盈亏</span>
            <span class="profit-total-shouyi" :style="{color: data.shouYiColor}">{{ data.shouYiStr }}</span>
            <span v-if="data.profitList.length" class="profit-total-shouyirate">{{ data.shouYiRateStr }}%</span>
        </Card>
        <div class="profit-list">
            <div v-for="(item, i) in data.profitList" :key="item.stockId" class="profit-item" 
                :style="{borderBottom: i !== data.profitList.length - 1 ? '1px solid #f2f2f2' : 'none'}">
                <div class="profit-name">
                    <div class="profit-stock-name">{{ item.stockName }}</div>
                    <div class="profit-stock-id">{{ item.stockId }}</div>
                </div>
                <div class="profit-earn" :style="{color: item.earnColor}">{{ item.earn }}</div>
                <div class="profit-space-remaining"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { formatMoney } from '../util/money';
import statistics from '../model/statistics'

let data = ref({
    shouYiStr: '',
    shouYiRateStr: '',
    shouYiColor: '',
    profitList: []
})

onMounted(async () => {
    statistics.init(() => {
        let profitList = statistics.getStockProfitList();
        let statisticsData = statistics.getStatisticsData();
        data.value.shouYiStr = formatMoney(statisticsData.shouYi, 2);
        data.value.shouYiRateStr = formatMoney(statisticsData.shouYiRate, 2);
        console.log('statisticsData', statisticsData);
        if (statisticsData.shouYi > 0) {
            data.value.shouYiColor = '#ca1e1e';
        } else {
            data.value.shouYiColor = '#229e19';
        }
        data.value.profitList = profitList.map(item => {
            return {
                stockId: item.stockId,
                stockName: item.stockName,
                earn: formatMoney(item.earn, 2),
                avgCost: formatMoney(item.avgCost, 2),
                earnColor: item.earn > 0 ? '#ca1e1e' : '#229e19'
            }
        });
    });
})

</script>

<style scoped>
.profit-total-title {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin-right: 20px;
}

.profit-total-shouyi {
    font-size: 20px;
    font-weight: bold;
    margin-right: 5px;
}

.profit-total-shouyirate {
    font-size: 14px;
}

.profit-list {
    background-color: #fff;
    padding: 10px 15px;
}

.profit-item {
    display: flex;
    justify-content: space-between;
    padding-bottom: 10px;
    background-color: #fff;
    margin-bottom: 10px;
}

.profit-name {
    width: 200px;
}

.profit-stock-name {
    font-weight: 700;
}

.profit-stock-id {
    color: #9e9e9e;
}

.profit-earn {
    width: 200px;
}

.profit-space-remaining {
    flex: 1;
}
</style>