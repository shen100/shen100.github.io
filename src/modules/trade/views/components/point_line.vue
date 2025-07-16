<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps([
    'stockId',
    'date',
    'candleType',
    'totalMV',
    'lowMVInAll',
    'highMVInAll',
    'maxMVHeight',
    'prev',
    'lackDateCount',
])

let data = ref({
    positionX: 0,
    positionY: 0,
    lineDistance: 0,
    linePosX: 0,
    linePosY: 0,
    lineSizeX: 0,
    lineRotation: 0,
    lineVisible: false,
    pointPosX: 0,
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

    let gap = 8; // K线图中，每根蜡烛之间的间距
	data.value.lineDistance = boxWidth + gap;
	var rate = (props.totalMV - props.lowMVInAll) / (props.highMVInAll - props.lowMVInAll);
	data.value.positionY = props.maxMVHeight * (1 - rate)
	if (props.prev) {
		data.value.positionX = props.prev.positionX + data.value.lineDistance;
        data.value.linePosX = prev.positionX - positionX;
        data.value.linePosY = prev.positionY - positionY;
        
        // Calculate distance between points
        var distance = Math.sqrt(
            Math.pow(positionX - prev.positionX, 2) + 
            Math.pow(positionY - prev.positionY, 2)
        );
        
        data.value.lineSizeX = distance;
        
        // Vector subtraction
        var p = {
            x: positionX - prev.positionX,
            y: positionY - prev.positionY
        };
        
        // Calculate rotation angle
        var r = Math.atan2(p.y, p.x);
        
        lineRotation = r;
        data.value.lineVisible = true;
    } else {
		// 早几年的，可能数据有缺失
		if (props.lackDateCount > 0) {
			positionX = positionX + data.value.lineDistance * props.lackDateCount;
        }
		data.value.lineVisible = false;
    }
		
	data.value.linePosX = data.value.linePosX + data.value.boxWidth / 2;
    data.value.pointPosX = data.value.pointPosX + data.value.boxWidth / 2;
})

</script>