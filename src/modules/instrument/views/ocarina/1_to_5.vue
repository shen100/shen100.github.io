<template>
    <div>
        <Form inline :label-width="100">
            <FormItem label="时间间隔">
                <InputNumber :max="100" :min="1" v-model="timeout" style="margin-right: 15px;"/>
                <Button type="primary" @click="onSubmit">确定</Button>
            </FormItem>
        </Form>
        <h2 style="padding-left: 100px; font-size: 64px; font-weight: 700;">{{ num }}</h2>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

let num = ref(0)
let intervalId = ref(0)
let timeout = ref(3)

function getRandNum() {
    function getRand() {
        return Math.floor(5 * Math.random()) + 1;
    }
    while (true) {
        let randNum = getRand();

        if (randNum === num.value) {
            continue;
        }
        return randNum;
    }
}

onMounted(() => {
    num.value = getRandNum();
    intervalId.value = setInterval(() => {
        num.value = getRandNum();
    }, timeout.value * 1000);
})

onBeforeUnmount(() => {
    clearInterval(intervalId.value);
})

function onSubmit() {
    if (timeout.value <= 0) {
        timeout.value = 1;
    }
    clearInterval(intervalId.value);
    intervalId.value = setInterval(() => {
        num.value = getRandNum();
    }, timeout.value * 1000);
}
</script>

<style scoped>

</style>