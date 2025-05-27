<template>
    <div class="candle-box" :style="{minWidth: `${data.boxWidth}px`}">
        <div class="candle-bg-box" :style="{width: `${data.boxWidth}px`, height: `${data.boxHeight}px`, backgroundColor: data.boxBgColor, top: `${data.boxPosY}px`}"></div>
        <div class="candle-inner-white-box" :style="{width: `${data.boxWhiteWidth}px`, height: `${data.boxWhiteHeight}px`, top: `${data.boxWhitePosY}px`}"></div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps([
    'stockId',
    'candleType', // week, month, year
    'date',
    'lowPrice',
    'highPrice',
    'openPrice',
    'closePrice',
    'lowPriceInAll',
    'highPriceInAll',
    'maxCandleHeight',
])

let data = ref({
    boxWidth: '0',
    boxHeight: '0',
    boxBgColor: '#ffffff',
    boxPosX: 0,
    boxPosY: 0,
    boxWhiteWidth: '0',
    boxWhiteHeight: '0',
    boxWhitePosX: 0,
    boxWhitePosY: 0,
    lineColor: '#ffffff',
    linePosX: 0,
    linePosY: 0,
    lineWidth: 0,
    lineHeight: 0,
})

onMounted(async () => {
    data.value.boxWidth = '8';
    if (props.candleType == "week") {
        data.value.boxWidth = '22';
    } else if (props.candleType == "month") {
        data.value.boxWidth = '30';
    } else if (props.candleType == "year") {
        data.value.boxWidth = '40';
    }

    var priceDt = props.highPriceInAll - props.lowPriceInAll;
    var lineRate = (props.highPrice - props.lowPrice) / priceDt;
    var boxRate = Math.abs((props.closePrice - props.openPrice) / priceDt);
    data.value.lineHeight = Math.max(props.maxCandleHeight * lineRate, 2);
    data.value.boxHeight = Math.max(props.maxCandleHeight * boxRate, 2);
    data.value.boxWhiteWidth = data.value.boxWidth - 2;
    data.value.boxWhiteHeight = data.value.boxHeight - 2;
	
    var lineY = (props.highPriceInAll - props.highPrice) / priceDt * props.maxCandleHeight;
    var boxY = (props.highPriceInAll - Math.max(props.openPrice, props.closePrice)) / priceDt * props.maxCandleHeight;
    data.value.boxPosY = boxY;
    data.value.boxWhitePosY = boxY + 1;
    data.value.linePosY = lineY;
    data.value.linePosX = (data.value.boxWidth - data.value.lineWidth) / 2;
	
    if (props.closePrice > props.openPrice) {
        rise();
    } else if (props.closePrice === props.openPrice) {
        equal();
    } else {
        crash();
    }
})

function rise() {
    data.value.boxBgColor = "#ee2500";
    data.value.lineColor = "#ee2500";
    data.value.filledBoxVisible = false;
}

function equal() {
    data.value.boxBgColor = "#868686";
    data.value.lineColor = "#868686";
    data.value.filledBoxVisible = false;
}

function crash() {
    data.value.boxBgColor = "#02b33d";
    data.value.lineColor = "#02b33d";
    data.value.filledBoxVisible = false;
    data.value.boxVisible = true;
}

</script>

<style scoped>
.candle-box {
    position: relative;
    display: inline-block;
    vertical-align: top;
    margin-right: 4px;
}

.candle-bg-box {
    position: absolute;
}

.candle-inner-white-box {
    background-color: #fff;
    position: absolute;
    left: 1px;
}
</style>