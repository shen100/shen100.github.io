<template>
    <div class="task-box">
        <Card style="flex: 1; min-height: 500px;">
            <div class="task-form-item">
                <span class="task-form-item-label">任务分组</span>
                <Select v-model="data.groupName" @on-change="onGroupChange" style="width: 420px">
                    <Option v-for="item in data.groups" :value="item.groupName" :key="item.groupName">{{ item.groupName }}</Option>
                </Select>
            </div>
            <div class="task-form-item">
                <span class="task-form-item-label">任务</span>
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
import { onMounted, ref, computed, onBeforeUnmount } from 'vue'
import { io } from 'socket.io-client';
import { formatLocalYMDHMS } from '../util/date';
import config from '../config/config.js';

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
                },
                {
                    value: 'a_equal_weight_index',
                    label: 'a_equal_weight_index',
                    desc: '更新每日全A等权指数'
                },
                {
                    value: 'index_recent_decline_md',
                    label: 'index_recent_decline_md',
                    desc: '统计上证指数、科创50近几年的跌幅'
                }
            ]
        },
        {
            groupName: '交易策略',
            tasks: [
                {
                    value: 'tradeStocksByStrategy1',
                    label: 'tradeStocksByStrategy1',
                    desc: '到达最高价后回调'
                },
                {
                    value: 'tradeStocksByStrategy2',
                    label: 'tradeStocksByStrategy2',
                    desc: '最后一个交易日达到最高价'
                },
                {
                    value: 'tradeStocksByStrategy3',
                    label: 'tradeStocksByStrategy3',
                    desc: '最近10天涨幅超过50%'
                },
                {
                    value: 'tradeStocksByStrategy4',
                    label: 'tradeStocksByStrategy4',
                    desc: '最近10天涨幅最高超过30%，且有回调'
                }
            ]
        },
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
    data.value.task = '';
    data.value.logListTmp = [];
}

async function onChange() {
    const res = await axios({
		method: 'get',
		url: config.url + '/api/tasks/last_history?task=' + data.value.task
	});
	let resData = res.data.data;
    data.value.lastExecTime = resData ? new Date(resData.createdAt) : null;
}

async function onSubmit() {
    let url = config.url + '/api/tasks/exec';
    const res = await axios.post(url, {
		task: data.value.task,
        socketId: data.value.socketId,
	});
	let resData = res.data.data;
    if (resData && resData.createdAt) {
        data.value.lastExecTime = new Date(resData.createdAt);
    }
}
</script>

<style scoped>
.task-box {
    display: flex;
    gap: 20px;
}

.task-form-item {
    padding-top: 10px;
    margin-bottom: 10px;
}

.task-form-item-label {
    display: inline-block;
    width: 80px;
    text-align: right;
    margin-right: 10px;
}

.task-description {
    padding-top: 10px;
}

.desc-label {
    display: inline-block;
    vertical-align: top;
    width: 80px;
    text-align: right;
    margin-right: 10px;
}
</style>