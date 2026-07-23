<template>
    <div class="stock-info-popup" :style="{ left: data.left }">
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
        <div class="stock-info-popup-txt-box">
            <div>成交量</div>
            <div class="space"></div>
            <div>{{ (props.info.volume / 10000).toFixed(2) + '万手' }}</div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
const props = defineProps(['info']);

let data = ref({
    left: '0px',
});

const upDownRate = computed({
    get() {
        if (props.info && typeof props.info.prevClosePrice !== 'undefined') {
            let rateValue = (props.info.closePrice - props.info.prevClosePrice) / props.info.prevClosePrice;
            return (100 * rateValue).toFixed(2) + '%';
        }
        return '';
    }
})

onMounted(async () => {
    let left = props.info.index * 9 - props.info.scrollLeft;
    if (left < props.info.containerWidth / 2) {
        left += 160;
    } else {
        left -= 262;
    }
    data.value.left = left + 'px';
});

</script>

<style scoped>
.stock-info-popup {
	position: absolute;
    left: 0px;
    top: 55px;
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