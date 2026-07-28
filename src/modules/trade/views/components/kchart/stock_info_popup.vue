<template>
    <div class="stock-info-popup" :style="{ left: data.left }">
        <div class="stock-info-popup-txt-box">
            <div v-if="props.info.kLineType === 'minute'">时间</div>
            <div v-else>日期</div>
            <div class="space"></div>
            <div>{{ props.info.time }}</div>
        </div>
        <template v-if="props.info && props.info.kLineType === 'minute'">
            <div class="stock-info-popup-txt-box">
                <div>价格</div>
                <div class="space"></div>
                <div>{{ props.info.closePrice.toFixed(2) }}</div>
            </div>
        </template>
        <template v-else>
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
        </template>
        <div v-if="upDownRate" class="stock-info-popup-txt-box">
            <div>涨跌幅</div>
            <div class="space"></div>
            <div>{{ upDownRate }}</div>
        </div>
        <div class="stock-info-popup-txt-box">
            <div>成交量</div>
            <div class="space"></div>
            <div>{{ volume }}</div>
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
        if (props.info && props.info.kLineType === 'minute') {
            if (typeof props.info.prevDayClosePrice !== 'undefined') {
                let rateValue = (props.info.closePrice - props.info.prevDayClosePrice) / props.info.prevDayClosePrice;
                return (100 * rateValue).toFixed(2) + '%';
            }
        }
        if (props.info && typeof props.info.prevClosePrice !== 'undefined') {
            let rateValue = (props.info.closePrice - props.info.prevClosePrice) / props.info.prevClosePrice;
            return (100 * rateValue).toFixed(2) + '%';
        }
        return '';
    }
})

const volume = computed({
    get() {
        let v = props.info.volume;
        if (props.info && props.info.kLineType === 'minute') {
            v = v / 100;
        }
        if (v < 10000) {
            return parseInt(v) + '手';
        }
        // 大于 1亿 手
        if (v > (10000 * 10000)) {
            return (v / 10000 / 10000).toFixed(2) + '亿手'
        }
        return (v / 10000).toFixed(2) + '万手';
    }
})

onMounted(async () => {
    let itemWidth = 0;
    if (props.info.kLineType === 'day') {
        itemWidth = 9;
    } else if (props.info.kLineType === 'minute') {
        itemWidth = 4;
    }
    let left = props.info.index * itemWidth - props.info.scrollLeft;
    if (left < props.info.containerWidth / 2) {
        left += 180;
    } else {
        left -= 282;
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
    width: 170px;
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