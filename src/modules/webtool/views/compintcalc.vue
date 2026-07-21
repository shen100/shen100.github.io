<template>
    <div>
        <Card>
            <Form :label-width="80">
                <FormItem label="初始资金">
                    <InputNumber :min="1" v-model="data.amount" style="width: 120px;"/>
                </FormItem>
                <FormItem label="收益率">
                    <Input v-model="data.rateStr" type="textarea" :rows="20" placeholder="" style="width: 600px; margin: 20px 0" />   
                </FormItem>
                <FormItem label="最终资金">
                    <div>{{ data.finalAmount }}</div>
                </FormItem>
                <FormItem label=" ">
                    <Button type="primary" @click="onSubmit">计算</Button>
                </FormItem>
            </Form>
        </Card>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { Message } from 'view-ui-plus'

let data = ref({
    amount: 1,
    finalAmount: 1,
    rateStr: ''
})

onMounted(async () => {
})

function onSubmit() {
    data.value.finalAmount = data.value.amount;
    data.value.rateStr = data.value.rateStr.replace(/^\s+|\s+$/g, '');
    let rateList = data.value.rateStr.split('\n');
    for (let i = 0; i < rateList.length; i++) {
        let rate = Number(rateList[i]);
        data.value.finalAmount = data.value.finalAmount * (1 + rate);
    }
}

</script>

<style scoped>
</style>