<template>
	<Modal
		v-model="data.myModalVisible"
        :before-close="onBeforeClose"
		:title="`编辑 ${props.stock?.stockName} 的K线`" :width="600">
		<Form :label-width="100">
            <FormItem label="标星">
                <Radio v-model="data.editModelData.isStar">⭐️</Radio>
			</FormItem>
			<FormItem label="最高价">
				<InputNumber :max="100000000" :min="-100000000" :step="0.0001" v-model="data.editModelData.highPrice" style="width: 100px"/>
			</FormItem>
			<FormItem label="止损">
				<InputNumber :max="100000000" :min="-100000000" :step="0.0001" v-model="data.editModelData.stopPrice" style="width: 100px"/>
			</FormItem>
			<FormItem label="买入">
				<div :key="i" v-for="(tradeAction, i) in data.editModelData.tradeActions">
                    <template v-if="tradeAction.type === 'buy'">
                        <DatePicker v-model="tradeAction.date" type="date" show-week-numbers placeholder="Select date" style="width: 120px" />
                        <span style="margin: 0 10px;">价格</span>
                        <InputNumber :max="100000000" :min="-100000000" :step="0.0001" v-model="tradeAction.price" style="width: 100px"/>
                        <span style="margin: 0 10px;">股数</span>
                        <InputNumber :max="1000000000" :min="1" v-model="tradeAction.count" />
                        <Button @click="onRemoveTradeAction(i)" shape="circle" icon="md-remove" size="small" style="margin-left: 10px"></Button>
                        <div style="height: 10px;"></div>
                    </template>
				</div>
				<Button @click="onAddTradeAction('buy')" shape="circle" icon="md-add" size="small"></Button>
			</FormItem>
            <FormItem label="卖出">
				<div :key="i" v-for="(tradeAction, i) in data.editModelData.tradeActions">
                    <template v-if="tradeAction.type === 'sell'">
                        <DatePicker v-model="tradeAction.date" type="date" show-week-numbers placeholder="Select date" style="width: 120px" />
                        <span style="margin: 0 10px;">价格</span>
                        <InputNumber :max="100000000" :min="-100000000" :step="0.0001" v-model="tradeAction.price" style="width: 100px"/>
                        <span style="margin: 0 10px;">股数</span>
                        <InputNumber :max="1000000000" :min="1" v-model="tradeAction.count" />
                        <Button @click="onRemoveTradeAction(i)" shape="circle" icon="md-remove" size="small" style="margin-left: 10px"></Button>
                        <div style="height: 10px;"></div>
                    </template>
				</div>
				<Button @click="onAddTradeAction('sell')" shape="circle" icon="md-add" size="small"></Button>
			</FormItem>
		</Form>
		<template #footer>
			<Button type="text" @click="onCancel">取消</Button>
			<Button type="primary" @click="onOK">确定</Button>
		</template>
	</Modal>
</template>


<script setup>
import { onMounted, ref, watch } from 'vue';
import { Message } from 'view-ui-plus';
import { parseLocalYMDString } from '../../../util/date.js';

const emit = defineEmits(['hide-modal']);

const props = defineProps([
    'stock',
    'modalVisible',
    'kChartLocalKey'
]);

let data = ref({
    myModalVisible: false,
	editModelData: {
		highPrice: 0, 
        stopPrice: 0, 
		tradeActions: [],
        isStar: false
	}
})

onMounted(async () => {

});

watch(() => props.modalVisible, (newVal) => {
    data.value.myModalVisible = newVal;
    if (!newVal) {
        return;
    }
    data.value.editModelData.highPrice = 0;
    data.value.editModelData.stopPrice = 0;
    data.value.editModelData.tradeActions = [];
    data.value.editModelData.isStar = false;
    if (props.stock && props.stock.highPrice) {
        data.value.editModelData.highPrice = props.stock.highPrice;
    }
    if (props.stock && props.stock.stopPrice) {
        data.value.editModelData.stopPrice = props.stock.stopPrice;
    }
    if (props.stock) {
        data.value.editModelData.isStar = !!props.stock.isStar;
    }
    if (props.stock && props.stock.tradeActions) {
        for (let i = 0; i < props.stock.tradeActions.length; i++) {
            data.value.editModelData.tradeActions.push({
                ...props.stock.tradeActions[i],
                date: parseLocalYMDString(props.stock.tradeActions[i].date)
            });
        }
    }
})

function onAddTradeAction(type) {
	data.value.editModelData.tradeActions.push({
		"type": type, 
		"date": new Date(),
		"price": 0, 
		"count": 0, 
	});
}

function onRemoveTradeAction(i) {
	data.value.editModelData.tradeActions.splice(i, 1)
}

function onOK() {
    if (!(data.value.editModelData.highPrice > 0)) {
        Message.error({
            duration: 10,
            content: '无效的最高价'
        });
        return
    }
    if (!(data.value.editModelData.stopPrice >= 0)) {
        Message.error({
            duration: 10,
            content: '无效的止损'
        });
        return
    }

    let kChartLocalKey = props.kChartLocalKey;
    let stocks = JSON.parse(localStorage.getItem(kChartLocalKey) || '[]');

	for (let i = 0; i < stocks.length; i++) {
        if (props.stock && props.stock.stockFullId === stocks[i].stockFullId) {
            let tradeActions = [];
            for (let j = 0; j < data.value.editModelData.tradeActions.length; j++) {
                let tAction = data.value.editModelData.tradeActions[j];
                if (!tAction.date) {
                    Message.error({
                        duration: 10,
                        content: '无效的时间'
                    });
                    return
                }
                if (!(tAction.price > 0)) {
                    Message.error({
                        duration: 10,
                        content: '无效的价格'
                    });
                    return
                }
                if (!(tAction.count > 0)) {
                    Message.error({
                        duration: 10,
                        content: '无效的股数'
                    });
                    return
                }
                let timestamp = tAction.date.getTime();
                timestamp += 8 * 3600 * 1000;
                tradeActions.push({
                    ...tAction,
                    date: new Date(timestamp).toISOString().substring(0, 10)
                });
            }
            stocks[i].highPrice = data.value.editModelData.highPrice;
            stocks[i].stopPrice = data.value.editModelData.stopPrice;
            stocks[i].isStar = data.value.editModelData.isStar;
            stocks[i].tradeActions = tradeActions;
            localStorage.setItem(kChartLocalKey, JSON.stringify(stocks, null, 4));
            location.reload();
            break;
        }
	}
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