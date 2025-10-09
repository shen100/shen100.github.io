<template>
    <div class="stock-info-popup">
        <div class="stock-info-popup-txt-box">
            <div>日期</div>
            <div class="space"></div>
            <div>{{ props.info.date }}</div>
        </div>
        <div class="stock-info-popup-txt-box">
            <div>开盘价</div>
            <div class="space"></div>
            <div>{{ props.info.openPrice.toFixed(2) }}</div>
        </div>
        <div class="stock-info-popup-txt-box">
            <div>收盘价</div>
            <div class="space"></div>
            <div>{{ props.info.closePrice.toFixed(2) }}</div>
        </div>
        <div class="stock-info-popup-txt-box">
            <div>最高价</div>
            <div class="space"></div>
            <div>{{ props.info.highPrice.toFixed(2) }}</div>
        </div>
        <div class="stock-info-popup-txt-box">
            <div>最低价</div>
            <div class="space"></div>
            <div>{{ props.info.lowPrice.toFixed(2) }}</div>
        </div>
        <div v-if="upDownRate" class="stock-info-popup-txt-box">
            <div>涨跌幅</div>
            <div class="space"></div>
            <div>{{ upDownRate }}</div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['info']);

const upDownRate = computed({
    get() {
        if (typeof props.info.prevClosePrice !== 'undefined') {
            let rateValue = (props.info.closePrice - props.info.prevClosePrice) / props.info.prevClosePrice;
            return (100 * rateValue).toFixed(2) + '%';
        }
        return '';
    }
})

</script>

<style scoped>
.stock-info-popup {
	position: absolute;
    left: 500px;
    top: 0;
    border: 1px solid #eee;
    padding: 5px 10px;
    width: 150px;
    z-index: 2;
    background-color: #fff;
}

.stock-info-popup-txt-box {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
}

.space {
    flex: 1;
}
</style>