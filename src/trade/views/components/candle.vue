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
    boxWidth: '0px',
    boxHeight: '0px',
    boxPosX: 0,
    boxPosY: 0,
    filledBoxWidth: '0px',
    filledBoxHeight: '0px',
    filledBoxPosX: 0,
    filledBoxPosY: 0,
    boxWhiteWidth: '0px',
    boxWhiteHeight: '0px',
    boxWhitePosX: 0,
    boxWhitePosY: 0,
    bgColor: '#ffffff',
    lineColor: '#ffffff',
    linePosX: 0,
    linePosY: 0,
    lineWidth: 0
})

onMounted(async () => {
    data.value.boxWidth = '16px';
    if (candleType == "week") {
		data.value.boxWidth = '22px';
    } else if (candleType == "month") {
		data.value.boxWidth = '30px';
    } else if(candleType == "year") {
		data.value.boxWidth = '40px';
    }

    var priceDt = highPriceInAll - lowPriceInAll;
	var lineRate = (highPrice - lowPrice) / priceDt;
	var boxRate = Math.abs((closePrice - openPrice) / priceDt);
	line.size.y = Math.max(props.maxCandleHeight * lineRate, 2);
	data.value.boxHeight = Math.max(props.maxCandleHeight * boxRate, 2);
    data.filledBoxWidth = data.value.boxWidth;
    data.filledBoxHeight = data.value.boxHeight;
	data.value.boxWhiteWidth = data.value.boxWidth - 6;
	data.value.boxWhiteHeight = data.value.boxHeight - 6;
	
	var lineY = (props.highPriceInAll - props.highPrice) / priceDt * props.maxCandleHeight;
	var boxY = (props.highPriceInAll - Math.max(props.openPrice, props.closePrice)) / priceDt * props.maxCandleHeight;
	data.value.boxPosY = boxY;
	data.value.filledBoxPosY = boxY;
	data.value.boxWhitePosX = 3;
	data.value.boxWhitePosY = boxY + 3;
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
	data.value.bgColor = "#ee2500";
	data.value.lineColor = "#ee2500";
    data.value.filledBoxVisible = false;
}

function equal() {
    data.value.bgColor = "#868686";
	data.value.lineColor = "#868686";
    data.value.filledBoxVisible = false;
}

function crash() {
    data.value.bgColor = "#02b33d";
	data.value.lineColor = "#02b33d";
    data.value.filledBoxVisible = false;
    data.value.boxVisible = true;
}

</script>