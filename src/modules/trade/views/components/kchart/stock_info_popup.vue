<template>
    <div @mousedown="onMouseDown" class="stock-info-popup" :style="{ right: data.right + 'px', top: data.top + 'px' }">
        <div v-if="data.info" style="padding: 5px 10px; border: 1px solid #eee;">
            <div class="stock-info-popup-txt-box">
                <div v-if="data.info.kLineType === 'minute'">时间</div>
                <div v-else>日期</div>
                <div class="space"></div>
                <div>{{ data.info.time }}</div>
            </div>
            <template v-if="data.info && data.info.kLineType === 'minute'">
                <div class="stock-info-popup-txt-box">
                    <div>价格</div>
                    <div class="space"></div>
                    <div>{{ data.info.closePrice.toFixed(2) }}</div>
                </div>
            </template>
            <template v-else>
                <div class="stock-info-popup-txt-box">
                    <div>开盘价</div>
                    <div class="space"></div>
                    <div>{{ data.info.openPrice.toFixed(2) }}</div>
                </div>
                <div class="stock-info-popup-txt-box">
                    <div>收盘价</div>
                    <div class="space"></div>
                    <div>{{ data.info.closePrice.toFixed(2) }}</div>
                </div>
                <div class="stock-info-popup-txt-box">
                    <div>最高价</div>
                    <div class="space"></div>
                    <div>{{ data.info.highPrice.toFixed(2) }}</div>
                </div>
                <div class="stock-info-popup-txt-box">
                    <div>最低价</div>
                    <div class="space"></div>
                    <div>{{ data.info.lowPrice.toFixed(2) }}</div>
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
            <div class="stock-info-popup-txt-box">
                <div>成交量2</div>
                <div class="space"></div>
                <div>{{ data.info?.volume }}</div>
            </div>
            <div class="stock-info-popup-txt-box">
                <div>成交额</div>
                <div class="space"></div>
                <div>{{ amount }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue'
const props = defineProps(['activeKItemData']);

let data = ref({
    info: null,
    right: 200,
    top: 55,
    dragging: false,
    clientX: 0,
    clientY: 0,
    oldRight: 200,
    oldTop: 55
});

watch(
    () => props.activeKItemData,
    (newValue, oldValue) => {
        if (newValue) {
            data.value.info = newValue;
        }
    }
)

const upDownRate = computed({
    get() {
        if (!data.value.info) {
            return '';
        }
        if (data.value.info && data.value.info.kLineType === 'minute') {
            if (typeof data.value.info.prevDayClosePrice !== 'undefined') {
                let rateValue = (data.value.info.closePrice - data.value.info.prevDayClosePrice) / data.value.info.prevDayClosePrice;
                return (100 * rateValue).toFixed(2) + '%';
            }
        }
        if (data.value.info && typeof data.value.info.prevClosePrice !== 'undefined') {
            let rateValue = (data.value.info.closePrice - data.value.info.prevClosePrice) / data.value.info.prevClosePrice;
            return (100 * rateValue).toFixed(2) + '%';
        }
        return '';
    }
})

const volume = computed({
    get() {
        if (!data.value.info) {
            return '';
        }
        let v = data.value.info.volume;
        // 小于 1 万股
        if (v < 10000) {
            return parseInt(v) + '股';
        }
        // 大于 1亿 股
        if (v > (10000 * 10000)) {
            return (v / 10000 / 10000).toFixed(2) + '亿股'
        }
        return (v / 10000).toFixed(2) + '万股';
    }
});

const amount = computed({
    get() {
        if (!data.value.info) {
            return '';
        }
        let amt = data.value.info.amount;
        // 大于 1亿 元
        if (amt > 10000) {
            return (amt / 10000).toFixed(2) + '亿'
        }
        return amt.toFixed(2) + '万';
    }
})

onMounted(async () => {
    data.value.info = props.activeKItemData;
    if (!data.value.info) {
        return;
    }
});

function onMouseDown(event) {
    data.value.dragging = true;
    data.value.clientX = event.clientX;
    data.value.clientY = event.clientY;
    data.value.oldRight = data.value.right;
    data.value.oldTop = data.value.top;
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
}

const onMouseMove = (event) => {
    if (!data.value.dragging) {
        return;
    }
    data.value.right = data.value.oldRight - (event.clientX - data.value.clientX);
    data.value.top = data.value.oldTop + (event.clientY - data.value.clientY);
    data.value.top = Math.max(data.value.top, 55);
}

const onMouseUp = () => {
    if (!data.value.dragging) {
        return;
    }
    data.value.dragging = false;
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
}

function hide() {
    data.value.info = null;
}

defineExpose({ hide });
</script>

<style scoped>
.stock-info-popup {
	position: absolute;
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