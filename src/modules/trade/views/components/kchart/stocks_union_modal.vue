<template>
	<Modal
		v-model="data.myModalVisible"
        :before-close="onBeforeClose"
		:title="`更新 ${kChartLocalKeyLabel}`" :width="600">
		<div>
            <Input v-model="data.jsonStr" type="textarea" :rows="20" placeholder="" style="margin: 20px 0" />    
        </div>
		<template #footer>
			<Button type="text" @click="onCancel">取消</Button>
			<Button type="primary" @click="onOK">确定</Button>
		</template>
	</Modal>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

const emit = defineEmits(['hide-modal', 'stocks-union']);

const props = defineProps([
    'kChartLocalKey',
    'kChartLocalKeyLabel',
    'modalVisible'
]);

let data = ref({
    myModalVisible: false,
    jsonStr: ''
})

onMounted(async () => {

});

watch(() => props.modalVisible, (newVal) => {
    data.value.myModalVisible = newVal;
})

function onOK() {
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
    data.value.myModalVisible = false;
    emit('hide-modal');
}

function onCancel() {
    data.value.myModalVisible = false;
    emit('hide-modal');
}
</script>

<style scoped>
.potential-stock-name {
    font-weight: 700;
}
</style>