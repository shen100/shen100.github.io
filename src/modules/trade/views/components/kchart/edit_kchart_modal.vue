<template>
	<Modal
		v-model="data.myModalVisible"
        :before-close="onBeforeClose"
		title="编辑K线" :width="600">
		<Form :label-width="100">
			<FormItem label="最高价">
				<InputNumber :max="100000000" :min="-100000000" :step="0.0001" v-model="data.editModelData.highPrice" style="width: 100px"/>
			</FormItem>
			<FormItem label="止损">
				<InputNumber :max="100000000" :min="-100000000" :step="0.0001" v-model="data.editModelData.stopPrice" style="width: 100px"/>
			</FormItem>
			<FormItem label="买入">
				<div :key="i" v-for="(tradeAction, i) in data.editModelData.tradeActions" style="margin-bottom: 10px;">
					<DatePicker v-if="tradeAction.type === 'buy'" v-model="tradeAction.date" type="date" show-week-numbers placeholder="Select date" style="width: 150px" />
					<span style="margin: 0 10px;">价格</span>
					<InputNumber :max="100000000" :min="-100000000" :step="0.0001" v-model="tradeAction.price" style="width: 100px"/>
					<span style="margin: 0 10px;">股数</span>
					<InputNumber :max="1000000000" :min="1" v-model="tradeAction.count" />
					<Button @click="onRemoveTradeActionBuy(i)" shape="circle" icon="md-remove" size="small" style="margin-left: 10px"></Button>
				</div>
				<Button @click="onAddTradeActionBuy" shape="circle" icon="md-add" size="small"></Button>
			</FormItem>
		</Form>
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
    'editModalVisible'
]);

let data = ref({
    myModalVisible: false,
	editModelData: {
		highPrice: 0, 
        stopPrice: 0, 
		tradeActions: []
	}
})

onMounted(async () => {

});

watch(() => props.editModalVisible, (newVal) => {
    data.value.myModalVisible = newVal;
    if (newVal) {
        data.value.editModelData.highPrice = 0;
        data.value.editModelData.stopPrice = 0;
        data.value.editModelData.tradeActions = [];
        if (props.stock && props.stock.highPrice) {
            data.value.editModelData.highPrice = props.stock.highPrice;
        }
        if (props.stock && props.stock.stopPrice) {
            data.value.editModelData.stopPrice = props.stock.stopPrice;
        }
        if (props.stock && props.stock.tradeActions) {
            for (let i = 0; i < props.stock.tradeActions.length; i++) {
                data.value.editModelData.tradeActions.push({
                    ...props.stock.tradeActions[i],
                    date: parseLocalYMDString(props.stock.tradeActions[i].date)
                });
            }
        }
    }
})


function onShowEditModal() {
	
}

function onAddTradeActionBuy() {
	data.value.editModelData.tradeActions.push({
		"type": "buy", 
		"date": new Date(),
		"price": 0, 
		"count": 0, 
	});
}

function onRemoveTradeActionBuy(i) {
	data.value.editModelData.tradeActions.splice(i, 1)
}

function onEditOK() {
    if (!(data.value.editModelData.highPrice > 0)) {
        Message.error({
            duration: 10,
            content: '无效的最高价'
        });
        return
    }
    if (!(data.value.editModelData.stopPrice > 0)) {
        Message.error({
            duration: 10,
            content: '无效的止损'
        });
        return
    }

    let kChartLocalKey = localStorage.getItem('tradeKChartLocalKey');
    let stocks = JSON.parse(localStorage.getItem(kChartLocalKey) || '[]');

	for (let i = 0; i < stocks.length; i++) {
		if (props.stock && props.stock.stockFullId === stocks[i].stockFullId) {
			stocks[i].highPrice = data.value.editModelData.highPrice;
			stocks[i].stopPrice = data.value.editModelData.stopPrice;
			let tradeActions = [];
			for (let i = 0; i < data.value.editModelData.tradeActions.length; i++) {
                console.log('date 111', typeof data.value.editModelData.tradeActions[i].date, data.value.editModelData.tradeActions[i].date);
                console.log('price 111', typeof data.value.editModelData.tradeActions[i].price, data.value.editModelData.tradeActions[i].price);
                console.log('count 111', typeof data.value.editModelData.tradeActions[i].count, data.value.editModelData.tradeActions[i].count);

                if (!data.value.editModelData.tradeActions[i].date) {
                    Message.error({
                        duration: 10,
                        content: '无效的时间'
                    });
                    return
                }
                if (!(data.value.editModelData.tradeActions[i].price > 0)) {
                    Message.error({
                        duration: 10,
                        content: '无效的价格'
                    });
                    return
                }
                if (!(data.value.editModelData.tradeActions[i].count > 0)) {
                    Message.error({
                        duration: 10,
                        content: '无效的股数'
                    });
                    return
                }
				let timestamp = data.value.editModelData.tradeActions[i].date.getTime();
				timestamp += 8 * 3600 * 1000;
				tradeActions.push({
					...data.value.editModelData.tradeActions[i],
					date: new Date(timestamp).toISOString().substring(0, 10)
				});
			}
			stocks[i].tradeActions = tradeActions;
			localStorage.setItem(kChartLocalKey, JSON.stringify(stocks));
			location.reload();
			break;
		}
	}
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