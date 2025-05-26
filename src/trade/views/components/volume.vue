<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps([
    'stockId',
    'date',
    'candleType',
    'openPrice',
    'closePrice',
    'volume',
    'lowVolumeInAll',
    'highVolumeInAll',
    'maxVolumeHeight',
]);

let data = ref({
    boxColor: '#fff',
    boxFilledColor: '#fff',
    boxVisible: true,
    boxFilledVisible: true,
    boxWidth: '0px',
    boxHeight: '0px',
    boxPosX: 0,
    boxPosY: 0,
    boxFilledWidth: '0px',
    boxFilledHeight: '0px',
    boxFilledPosX: 0,
    boxFilledPosY: 0,
    boxWhiteWidth: '0px',
    boxWhiteHeight: '0px',
    boxWhitePosX: 0,
    boxWhitePosY: 0,
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

    var rate = props.volume / props.highVolumeInAll;
	data.value.boxHeight = Math.max(props.maxVolumeHeight * rate, 2);
	data.value.boxFilledWidth = data.value.boxWidth;
	data.value.boxFilledHeight = data.value.boxHeight;
	data.value.boxWhiteWidth = data.value.boxWidth - 6;
	data.value.boxWhiteHeight = data.value.boxHeight - 6;
	
	data.value.boxPosY = props.maxVolumeHeight - data.value.boxHeight
	data.value.boxFilledPosY = data.value.boxPosY;
	data.value.boxWhitePosX = 3;
	data.value.boxWhitePosY = data.value.boxPosy + 3;

	if (props.closePrice >= props.openPrice) {
		rise();
    } else {
		crash();
    }
})


function rise() {
	data.value.boxColor = "#ee2500";
	data.value.boxFilledVisible = false;
}

function crash() {
	data.value.boxFilledColor = "#02b33d";
	data.value.boxVisible = false;
}
</script>