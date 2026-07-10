<template>
    <div class="stock-new-price-box">
        <span class="stock-name">
            <a class="stock-name-link" :href="`https://xueqiu.com/S/${props.stockFullId}`" target="_blank">
                {{ props.stockName }}
            </a>
        </span>
        <span class="stock-cur-price" :style="{color: props.lastPriceUpColor}">¥{{ props.curPrice }}</span>
        <span class="stock-price-change" :style="{color: props.lastPriceUpColor}">
            {{ props.dtPriceUpdated ? (props.dtPrice > 0 ? '+' : '') + props.dtPrice.toFixed(2) : ''}}
        </span>
        <span class="stock-price-change2" :style="{color: props.lastPriceUpColor, 'margin-left': '10px'}">
            {{ dtRateStr }}
        </span>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps([
    'stockFullId',
    'stockName',
    'curPrice',
	'lastPriceUpColor',
    'dtPriceUpdated',
    'dtPrice',
    'dtRate'
]);

const dtRateStr = computed(() => {
    let str = (props.dtRate * 100).toFixed(2) + '%';
    if (str.charAt(0) !== '-') {
        str = '+' + str;
    }
    return str;
})
</script>

<style scoped>
.stock-new-price-box {
    background-color: #fff;
    border: 1px solid #e2e2e2;
    border-bottom: none;
    padding: 8px 15px 8px 15px ;
}

.stock-name {
    font-size: 15px;
    display: inline-block;
    width: 100px;
}

.stock-name-link {
	color: rgb(81, 90, 110);
}

.stock-name-link:hover {
	color: #2d8cf0;
}

.stock-cur-price {
    font-size: 16px;
	margin: 0 10px 0 20px;
    display: inline-block;
    width: 70px;
}

.stock-price-change {
	font-size: 16px;
	font-weight: 400;
    display: inline-block;
    width: 70px;
}

.stock-price-change2 {
	font-size: 16px;
	font-weight: 400;
    display: inline-block;
    width: 90px;
    text-align: right;
}
</style>