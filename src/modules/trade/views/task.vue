<template>
    <div class="task-box">
        <Card style="flex: 1; min-height: 500px;">
            <div>
                <Select v-model="data.task" @on-change="onChange" style="width: 420px">
                    <Option v-for="item in data.tasks" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
                <Button type="primary" @click="onSubmit" style="margin-left: 10px;">执行</Button>
            </div>
            <div class="task-description">
                <span class="desc-label">任务描述: </span>
                <span>{{ description }}</span>
            </div>
            <div class="task-description">
                <span class="desc-label">最后执行: </span>
                <span>{{ lastExecTimeStr }}</span>
            </div>
        </Card>
        <Card style="flex: 1; min-height: 500px;">
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
import { formatLocalYMD, formatLocalYMDHMS } from '../util/date';
import { trim } from '../util/str';
import config from '../config/config.js';
import { Card } from 'view-ui-plus';

let data = ref({
    task: '',
    lastExecTime: null,
    tasks: [
        {
            value: 'save_kline_day_to_db',
            label: 'save_kline_day_to_db',
            desc: '把所有股票的历史K线(日线)存入数据库'
        },
        {
            value: 'save_stock_detail_to_db',
            label: 'save_stock_detail_to_db',
            desc: '把所有股票的详细信息存入数据库'
        },
        {
            value: 'save_tushare_daily_basic_to_db',
            label: 'save_tushare_daily_basic_to_db',
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
});

const lastExecTimeStr = computed(() => {
    if (!data.value.lastExecTime) {
        return '';
    }
    return formatLocalYMDHMS(data.value.lastExecTime);
});

async function onChange(value) {
    const res = await axios({
		method: 'get',
		url: config.url + '/api/tasks/last_history?task=' + data.value.task
	});
	let resData = res.data.data;
    console.log(resData);
    data.value.lastExecTime = resData ? new Date(resData.createdAt) : null;
}

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

.desc-label {
    display: inline-block;
    vertical-align: top;
    margin-right: 8px;
}
</style>