<template>
    <div>
        <div style="display: flex; gap: 20px">
            <Card style="flex: 1;">
                <div>
                    <Input v-model="data.str" type="textarea" :rows="20" placeholder="" style="width: 600px; margin: 20px 0" />    
                </div>
            </Card>
            <Card style="flex: 1;">
                <div>
                    <pre><code>{{ data.jsonStr }}</code></pre>
                </div>
            </Card>
        </div>
        <div style="margin-top: 20px;">
            <Button type="primary" @click="onSubmit">确定</Button>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { Message } from 'view-ui-plus'
import { trim } from '../../util/str';
import axios from 'axios';

let data = ref({
    str: '',
    jsonStr: ''
})

onMounted(async () => {
})

async function onSubmit() {
    let stockNames = data.value.str.split('\n');
    for (let i = stockNames.length - 1; i >= 0; i--) {
        stockNames[i] = trim(stockNames[i]);
        if (!stockNames[i]) {
            stockNames.splice(i, 1);
        }
    }

    // if (!data.value.myLocalKey) {
    //     Message.error({
    //         duration: 10,
    //         content: '请选择key'
    //     });
    //     return
    // }
    

    let url = 'http://localhost:3000/api/stocks/get_stocks_by_names';
    const res = await axios.post(url, {
		stockNames
	});
	if (res.data.code !== 0) {
		Message.error({
			duration: 10,
			content: `请求接口失败`
		});
		return
	}
    let jsonStr = JSON.stringify(res.data.data.stocks, null, 4);
    data.value.jsonStr = jsonStr
}

</script>

<style scoped>
</style>