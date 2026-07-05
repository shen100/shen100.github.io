<template>
    <div>
        <Card>
            <Select v-model="data.myLocalKey" @on-change="onChange" style="width: 300px">
                <Option v-for="item in data.localKeys" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <div>
                <Input v-model="data.jsonStr" type="textarea" :rows="20" placeholder="" style="width: 600px; margin: 20px 0" />    
            </div>
            <div>
                <Button type="primary" @click="onSubmit">确定</Button>
            </div>
        </Card>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { Message } from 'view-ui-plus'

let data = ref({
    myLocalKey: '',
    localKeys: [
        {
            value: 'tradeAllFullIdStocks',
            label: '全部股票'
        },
        {
            value: 'tradeInvestedStocks',
            label: '当前持仓'
        },
        {
            value: 'tradePotentialStocks',
            label: '候选股'
        },
        {
            value: 'tradeTrackedStocks',
            label: '股票池'
        },
        {
            value: 'tradeTrackedStocksByStrategy1',
            label: '到达最高价后回踩'
        },
        {
            value: 'tradeTrackedStocksByStrategy2',
            label: '最后一个交易日达到最高价'
        }
    ],
    jsonStr: ''
})

onMounted(async () => {
})

function onChange(key) {
    let str = localStorage.getItem(key);
    data.value.jsonStr = '';
    if (str) {
        data.value.jsonStr = str;
    }
}

function onSubmit() {
    if (!data.value.myLocalKey) {
        Message.error({
            duration: 10,
            content: '请选择key'
        });
        return
    }
    localStorage.setItem(data.value.myLocalKey, data.value.jsonStr);
    Message.success({
        duration: 10,
        content: ' 设置成功'
    });
}

</script>

<style scoped>
</style>