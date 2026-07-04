<template>
	<Modal
		v-model="data.myModalVisible"
        :before-close="onBeforeClose"
		title="候选股" :width="400">
		<div>确定要把 <span class="potential-stock-name">{{ props.stock && props.stock.stockName }}</span> 加入到候选股?</div>
		<template #footer>
			<Button type="text" @click="onEditCancel">取消</Button>
			<Button type="primary" @click="onEditOK">确定</Button>
		</template>
	</Modal>
</template>


<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { Message } from 'view-ui-plus';
import { parseLocalYMDString } from '../../../util/date.js';

const emit = defineEmits(['hide-modal']);

const props = defineProps([
    'stock',
    'addPotentialModalVisible'
]);

let data = ref({
    myModalVisible: false,
})

onMounted(async () => {

});

watch(() => props.addPotentialModalVisible, (newVal) => {
    data.value.myModalVisible = newVal;
})


function onEditOK() {
    let stocks = JSON.parse(localStorage.getItem('tradePotentialStocks') || '[]');
    for (let i = 0; i < stocks.length; i++) {
        if (stocks[i].stockId === props.stock.stockId) {
            Message.error({
                duration: 10,
                content: props.stock.stockName + ' 已在候选股里'
            });
            emit('hide-modal');
            return;
        }
    }
    let theStock = JSON.parse(JSON.stringify(props.stock));
    stocks.push(theStock);
    let jsonStr = JSON.stringify(stocks);
    localStorage.setItem('tradePotentialStocks', jsonStr);
    emit('hide-modal');
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