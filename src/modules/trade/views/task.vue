<template>
    <div class="task-box">
        <Card style="flex: 1;">
            <div>
                <Select v-model="data.task" style="width: 300px">
                    <Option v-for="item in data.tasks" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
                <Button type="primary" @click="onSubmit" style="margin-left: 10px;">执行</Button>
            </div>
            <div class="task-description">{{ description }}</div>
        </Card>
        <Card style="flex: 1;">
            <div :key="i" v-for="(msg, i) in data.logList">{{ msg }}</div>
        </Card>
    </div>
</template>


<script setup>
import axios from 'axios';
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router';
import { io } from 'socket.io-client';
import KChartList from './components/kchart/kchart_list.vue';
import { formatLocalYMD } from '../util/date';
import { trim } from '../util/str';
import config from '../config/config.js';
import { Card } from 'view-ui-plus';

let data = ref({
    task: '',
    tasks: [
        {
            value: 'save_kline_day_to_db.js',
            label: 'save_kline_day_to_db.js',
            desc: '把所有股票的历史K线(日线)存入数据库'
        },
        {
            value: 'save_stock_detail_to_db.js',
            label: 'save_stock_detail_to_db.js',
            desc: '把所有股票的详细信息存入数据库'
        },
        {
            value: 'save_tushare_daily_basic_to_db.js',
            label: 'save_tushare_daily_basic_to_db.js',
            desc: '把每个公司每日的市值存入数据库'
        }
    ],
    socket: null,
    socketId: '',
    logList: []
})

onMounted(async () => {
    data.value.socket = io('http://127.0.0.1:3000');
    data.value.socket.on('log', printLog);
    data.value.socket.on('socketId', onGotSocketId);
});

function onGotSocketId(socketId) {
    data.value.socketId = socketId;
}

function printLog(message) {
    data.value.logList.unshift(message);
}

const description = computed(() => {
    for (let i = 0; i < data.value.tasks.length; i++) {
        if (data.value.tasks[i].value === data.value.task) {
            return data.value.tasks[i].desc;
        }
    }
    return '';
})

async function onSubmit() {
    let url = config.url + '/api/tasks/exec';
    const res = await axios.post(url, {
		task: data.value.task,
        socketId: data.value.socketId,
	});
	let resData = res.data.data;
}
</script>

<style scoped>
.task-box {
    display: flex;
    gap: 20px;
}

.task-description {
    margin-top: 10px;
}
</style>