<template>
    <div class="task-box">
        <Card style="flex: 1; min-height: 500px;">
            <div>
                <span>任务分组</span>
                <Select v-model="data.groupName" @on-change="onGroupChange" style="width: 420px">
                    <Option v-for="item in data.groups" :value="item.groupName" :key="item.groupName">{{ item.groupName }}</Option>
                </Select>
            </div>
            <div>
                <span>任务</span>
                <Select v-model="data.task" @on-change="onChange" style="width: 420px">
                    <Option v-for="item in tasks" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
                <Button type="primary" @click="onSubmit" style="margin-left: 10px;">执行</Button>
            </div>
            <div v-if="data.task" class="task-description">
                <span class="desc-label">任务描述: </span>
                <span>{{ description }}</span>
            </div>
            <div v-if="data.task" class="task-description">
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
    groupName: '',
    groups: [
        {
            groupName: '同步数据源',
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
                },
            ]
        },
        {
            groupName: '数据分析',
            tasks: [
                {
                    value: 'stat_money_flow',
                    label: 'stat_money_flow',
                    desc: '统计概念板块的资金流向'
                },
                {
                    value: 'stat_daily_surge_plunge_count',
                    label: 'stat_daily_surge_plunge_count',
                    desc: '统计每日暴涨暴跌数'
                },
                {
                    value: 'stat_daily_up_count',
                    label: 'stat_daily_up_count',
                    desc: '每日上涨股票数(和前 N 个交易日每天的股价相比)'
                }
            ]
        }
    ],
    task: '',
    lastExecTime: null,
    socket: null,
    socketId: '',
    logList: [],
    logListTmp: [],
    logIntervalId: 0
});

const tasks = computed(() => {
    for (let i = 0; i < data.value.groups.length; i++) {
        if (data.value.groups[i].groupName === data.value.groupName) {
            return data.value.groups[i].tasks;
        }
    }
    return [];
});

const description = computed(() => {
    console.log(JSON.parse(JSON.stringify(tasks.value)));
    console.log('data.value.task', data.value.task);
    for (let i = 0; i < tasks.value.length; i++) {
        if (tasks.value[i].value === data.value.task) {
            return tasks.value[i].desc;
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

onMounted(async () => {
    data.value.socket = io('http://127.0.0.1:3000');
    data.value.socket.on('log', printLog);
    data.value.socket.on('socketId', onGotSocketId);
    intervalSetLog();
});

function intervalSetLog() {
    data.value.logIntervalId = setInterval(function() {
        data.value.logList = data.value.logListTmp.slice(0);
    }, 3000);
}

onBeforeUnmount(() => {
    clearInterval(data.value.logIntervalId);
})

function onGotSocketId(socketId) {
    data.value.socketId = socketId;
}

function printLog(message) {
    data.value.logListTmp.unshift(message);
}

function onGroupChange(a) {
    console.log(a);
    console.log(123, data.value.groupName);
    data.value.task = '';
}

async function onChange() {
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