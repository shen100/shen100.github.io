<template>
	<Modal
		v-model="data.myModalVisible"
        :before-close="onBeforeClose"
		title="加入候选股" :width="400">
		<div>确定要把 <span class="potential-stock-name">{{ props.stock && props.stock.stockName }}</span> 加入到候选股?</div>
		<template #footer>
			<Button type="text" @click="onCancel">取消</Button>
			<Button type="primary" @click="onOK">确定</Button>
		</template>
	</Modal>
</template>


<script setup>
import { onMounted, ref, watch } from 'vue';
import { Message } from 'view-ui-plus';

const emit = defineEmits(['hide-modal']);

const props = defineProps([
    'stock',
    'modalVisible'
]);

let data = ref({
    myModalVisible: false,
})

onMounted(async () => {

});

watch(() => props.modalVisible, (newVal) => {
    data.value.myModalVisible = newVal;
})


function onOK() {
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
    stocks.unshift(theStock);
    let jsonStr = JSON.stringify(stocks, null, 4);
    localStorage.setItem('tradePotentialStocks', jsonStr);
    Message.success({
        duration: 10,
        content: '成功加入到候选股'
    });
    emit('hide-modal');
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