<template>
	<Modal
		v-model="data.myModalVisible"
        :before-close="onBeforeClose"
		:title="`更新 ${kChartLocalKeyLabel}`" :width="600">
		<div>
            <Input v-model="data.jsonStr" type="textarea" :rows="20" placeholder="" style="margin: 20px 0" />    
        </div>
		<template #footer>
			<Button type="text" @click="onEditCancel">取消</Button>
			<Button type="primary" @click="onEditOK">确定</Button>
		</template>
	</Modal>
</template>


<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { Message } from 'view-ui-plus';

const emit = defineEmits(['hide-modal', 'stocks-union']);

const props = defineProps([
    'kChartLocalKey',
    'kChartLocalKeyLabel',
    'unionModalVisible'
]);

let data = ref({
    myModalVisible: false,
    jsonStr: ''
})

onMounted(async () => {

});

watch(() => props.unionModalVisible, (newVal) => {
    data.value.myModalVisible = newVal;
})


function onEditOK() {
    let newStocks = JSON.parse(data.value.jsonStr);
    let stocks = JSON.parse(localStorage.getItem(props.kChartLocalKey) || '[]');

    for (let i = 0; i < newStocks.length; i++) {
        let foundStock;
        for (let j = 0; j < stocks.length; j++) {
            if (newStocks[i].stockId === stocks[j].stockId) {
                foundStock = stocks[j];
                break;
            }
        }
        if (foundStock) {
            newStocks.splice(i, 1, foundStock);
        }
    }
    let jsonStr = JSON.stringify(newStocks, null, 4);
    localStorage.setItem(props.kChartLocalKey, jsonStr);
    emit('stocks-union')
}

function onBeforeClose() {
    console.log('onBeforeClose');
    data.value.myModalVisible = false;
    emit('hide-modal');
}

function onEditCancel() {
    console.log('onEditCancel');
    data.value.myModalVisible = false;
    emit('hide-modal');
}
</script>

<style scoped>
.potential-stock-name {
    font-weight: 700;
}
</style>