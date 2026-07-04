<template>
    <div>
        <Card>
            <Select v-model="data.myLocalKey" @on-change="onChange" style="width: 300px">
                <Option v-for="item in data.localKeys" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <div style="margin-top: 10px; color: rgb(246 108 108);">{{ tipText }}</div>
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
            label: '最近 20 天， 80% 的时间处于上涨'
        }
    ],
    jsonStr: ''
})

onMounted(async () => {
})

const tipText = computed(() => {
    for (let i = 0; i < data.value.localKeys.length; i++) {
        if (data.value.localKeys[i].value === data.value.myLocalKey) {
            return data.value.localKeys[i].label
        }
    }
    return '';
})

function onChange(key) {
    let value = localStorage.getItem(key);
    data.value.jsonStr = '';
    if (value) {
        data.value.jsonStr = value;
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