<template>
    <div :id="'candle-container-' + date"
        @dblclick="onDoubleClick"
        @mouseenter="onMouseOver"
        @mouseleave="onMouseOut"
        @mousemove="onMouseMove" class="candle-container" :style="{minWidth: `${data.boxWidth + 2}px`}">
        <div class="candle-line" :style="candleLineStyle"></div>
        <div class="candle-box" :style="candleBoxStyle" 
            :class="{ 'candle-glow-green': isGreenGlow, 'candle-glow-red': isRedGlow, 'candle-glow-grey': isGreyGlow }">
            <div :style="candleInnerBoxStyle"></div>
        </div>
        <div v-if="data.isMouseOver" class="full-line" :style="{left: `${data.lineX}px`}"></div>

        <div v-if="isBuyOrSell" class="candle-line" :style="candleTradelineStyle"></div>
        <div v-if="isBuyOrSell" class="candle-box" :style="candleTradeSmallBoxStyle"></div>
        <div v-if="isBuyOrSell" class="candle-box" :style="candleTradeBoxStyle">
            <div class="candle-trade-box-txt">{{ props.tradeAction.type === 'buy' ? 'B' : 'S' }}</div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { Message } from 'view-ui-plus'

const props = defineProps([
    'stockId',
    'stockHighPrice', // 当前股票设置的最高参考价，可以和其他价格对比下涨跌幅
    'kLineType', // minute, day, week, month, year
    'date',
    'lowPrice',
    'highPrice',
    'openPrice',
    'closePrice',
    'volume',
    'amount',
    'lowPriceInAll',
    'highPriceInAll',
    'candleMaxHeight',
    'tradeAction',
    'staticVar' // candle 组件的多个实例之间共用的静态变量
]);

const emit = defineEmits(['mouse-over', 'mouse-out', 'mouse-move', 'range-change']);

const isGlow = ref(false);

let data = ref({
    boxWidth: 7,
    boxHeight: 0,
    boxBgColor: '#fff',
    boxX: 0,
    boxY: 0,
    lineColor: '#fff',
    lineX: 0,
    lineY: 0,
    lineWidth: 1,
    lineHeight: 0,
    isMouseOver: false,
});

const isGreenGlow = computed(() => {
    if (props.closePrice < props.openPrice && isGlow.value) {
        return true;
    }
    return false;
});

const isRedGlow = computed(() => {
    if (props.closePrice > props.openPrice && isGlow.value) {
        return true;
    }
    return false;
});

const isGreyGlow = computed(() => {
    if (props.closePrice === props.openPrice && isGlow.value) {
        return true;
    }
    return false;
});

const candleLineStyle = computed(() => {
    let backgroundColor = '';
    if (props.closePrice > props.openPrice) {
        backgroundColor = '#ee2500';
    } else if (props.closePrice === props.openPrice) {
        backgroundColor = '#868686';
    } else {
        backgroundColor = '#02b33d';
    }
    return {
        width: `${data.value.lineWidth}px`,
        height: `${data.value.lineHeight}px`,
        backgroundColor,
        left: `${data.value.lineX}px`,
        top: `${data.value.lineY}px`
    }
});

const candleBoxStyle = computed(() => {
    return {
        width: `${data.value.boxWidth}px`,
        height: `${data.value.boxHeight}px`,
        backgroundColor: data.value.boxBgColor,
        top: `${data.value.boxY}px`
    }
});

const candleInnerBoxStyle = computed(() => {
    let border = '';
    let backgroundColor = '';
    if (props.closePrice > props.openPrice) {
        border = `1px solid #ee2500`;
        backgroundColor = '#fff';
    } else if (props.closePrice === props.openPrice) {
        border = `1px solid #868686`;
        backgroundColor = '#868686';
    } else {
        border = `1px solid #02b33d`;
        backgroundColor = '#02b33d';
    }
    return {
        width: `${data.value.boxWidth}px`,
        height: `${data.value.boxHeight}px`,
        backgroundColor,
        border,
    }
});

const candleTradelineStyle = computed(() => {
    let theY = data.value.lineY - 40;
    if (data.value.lineY < 100) {
        theY = data.value.lineY + data.value.lineHeight + 5;
    }
    let borderLeft = '1px #ee2500 dashed';
    if (props.tradeAction.type === 'sell') {
        borderLeft = '1px #5287ee dashed';
    }
    return {
        width: `${data.value.lineWidth}px`,
        height: `30px`,
        borderLeft,
        left: `${data.value.lineX}px`,
        top: `${theY}px`
    }
});

const candleTradeSmallBoxStyle = computed(() => {
    let theY = data.value.lineY - 9;
    if (data.value.lineY < 100) {
        theY = data.value.lineY + data.value.lineHeight + 5;
    }
    let backgroundColor = '#ee2500';
    if (props.tradeAction.type === 'sell') {
        backgroundColor = '#5287ee';
    }
    return {
        width: `4px`,
        height: `4px`,
        borderRadius: '2px',
        backgroundColor,
        left: '1.5px',
        top: `${theY}px`
    }
});

const candleTradeBoxStyle = computed(() => {
    let theY = data.value.lineY - 56;
    if (data.value.lineY < 100) {
        theY = data.value.lineY + data.value.lineHeight + 35;
    }
    let backgroundColor = '#ee2500';
    if (props.tradeAction.type === 'sell') {
        backgroundColor = '#5287ee';
    }
    return {
        width: `16px`,
        height: `16px`,
        borderRadius: '8px',
        backgroundColor,
        left: '-4.5px',
        top: `${theY}px`
    }
});

const isBuyOrSell = computed(() => {
    if (!props.tradeAction) {
        return false;
    }
    return [ 'buy', 'sell' ].indexOf(props.tradeAction.type) >= 0;
});

onMounted(async () => {
    let priceDt = props.highPriceInAll - props.lowPriceInAll;
    let lineRate = (props.highPrice - props.lowPrice) / priceDt;
    let boxRate = Math.abs((props.closePrice - props.openPrice) / priceDt);
    data.value.lineHeight = Math.floor(props.candleMaxHeight * lineRate); // 每根蜡烛的最高价和最低价连线的高度
    data.value.boxHeight = Math.floor(props.candleMaxHeight * boxRate); // 每根蜡烛的开盘价和收盘价的实体高度
	
    let lineY = (props.highPriceInAll - props.highPrice) / priceDt * props.candleMaxHeight;
    lineY = Math.floor(lineY);
    // 计算candle-box的Y坐标, 用 开盘价、收盘价的最大值同 highPriceInAll 比较
    let boxY = (props.highPriceInAll - Math.max(props.openPrice, props.closePrice)) / priceDt * props.candleMaxHeight;
    boxY = Math.floor(boxY);
    data.value.boxY = boxY;
    data.value.lineY = lineY;
    data.value.lineX = (data.value.boxWidth - data.value.lineWidth) / 2;
});

function getCandleData() {
    return {
        stockId: props.stockId,
        kLineType: props.kLineType,
        time: props.date,
        lowPrice: props.lowPrice,
        highPrice: props.highPrice,
        openPrice: props.openPrice,
        closePrice: props.closePrice,
        volume: props.volume,
        amount: props.amount,
        tradeAction: props.tradeAction,
    }
}

function setMouseOver() {
    data.value.isMouseOver = true;
}

function onMouseOver() {
    data.value.isMouseOver = true;
    emit('mouse-over', getCandleData());
}

function setMouseOut() {
    data.value.isMouseOver = false;
}

function onMouseOut() {
    data.value.isMouseOver = false;
    emit('mouse-out');
}

function onMouseMove(event) {
    if (event.target === event.currentTarget) {
        // event.offsetY 鼠标相对于【当前绑定事件元素左上角】的垂直坐标（Y 值）
        let y = Math.min(event.offsetY, props.candleMaxHeight);
        let priceDt = props.highPriceInAll - props.lowPriceInAll;
        let price = props.highPriceInAll - (y / props.candleMaxHeight * priceDt);
        price = price.toFixed(2);

        emit('mouse-move', { price, y });
    }
}

async function onDoubleClick() {
    if (!props.closePrice) {
        return;
    }

    try {
        await navigator.clipboard.writeText('' + props.closePrice);
    } catch (err) {
        console.error('复制失败:', err);
    }

    props.staticVar.clickedCandles = props.staticVar.clickedCandles || [];

    if (isGlow.value) {
        isGlow.value = false;
        for (let i = 0; i < props.staticVar.clickedCandles.length; i++) {
            if (props.staticVar.clickedCandles[i].date === props.date) {
                props.staticVar.clickedCandles.splice(i, 1);
                emit('range-change', {
                    visible: false
                });
                break;
            }
        }
        return;
    }

    if (props.staticVar.clickedCandles.length === 2) {
        return;
    }

    isGlow.value = true;
    props.staticVar.clickedCandles.push({
        date: props.date,
        closePrice: props.closePrice,
        highPrice: props.highPrice,
        lowPrice: props.lowPrice,
    });

    if (props.staticVar.clickedCandles.length === 2) {
        let startData = props.staticVar.clickedCandles[0];
        let endData = props.staticVar.clickedCandles[1];
        if (startData.date > endData.date) {
            [ startData, endData ] = [ endData, startData ];
        }
        emit('range-change', {
            visible: true,
            startData,
            endData
        });
    }
}

defineExpose({ getCandleData, setMouseOver, setMouseOut });
</script>

<style scoped>
.candle-container {
    position: relative;
    display: inline-block;
    vertical-align: top;
    margin-right: 0;
}

.candle-line {
    position: absolute;
    pointer-events: none;
}

.candle-box {
    position: absolute;
    pointer-events: none;
}

.full-line {
    position: absolute;
    border-left: 1px dashed #cecece;
    height: 100%;
    pointer-events: none;
}

.candle-trade-box-txt {
    color: #fff;
    line-height: 16px;
    text-align: center;
    font-size: 10px;
}

.candle-glow-green {
    transition: box-shadow 0.2s ease;
    box-shadow: 0 0 10px 3px rgba(2, 179, 61, 0.32), 0 0 20px 8px rgba(2, 179, 61, 0.18);
}

.candle-glow-red {
    transition: box-shadow 0.2s ease;
    box-shadow: 0 0 10px 3px rgba(238, 37, 0, 0.32), 0 0 20px 8px rgba(238, 37, 0, 0.18);
}

.candle-glow-grey {
    transition: box-shadow 0.2s ease;
    box-shadow: 0 0 8px 2px #b8b8b8, 0 0 16px 6px rgba(134, 134, 134, 0.65);
}
</style>