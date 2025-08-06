<template>
    <div>
        <div class="encryption-box">
            <Input v-model="text1" type="textarea" :rows="40" placeholder="" />
            <div class="encryption-btn">
                <div>
                    <Button type="primary" @click="onEncrypt">加密</Button>
                </div>
                <div style="padding-top: 20px;">
                    <Button @click="onDecrypt">解密</Button>
                </div>
            </div>
            <Input v-model="text2" type="textarea" :rows="40" placeholder="" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { Message } from 'view-ui-plus'
import { encryptData, decryptData } from '../util/SecurityUtil';

let text1 = ref('');
let text2 = ref('');

async function onEncrypt() {
    const webToolPassword = localStorage.getItem('webToolPassword');
    if (!webToolPassword) {
        Message.error({
            duration: 10,
            content: '请先设置加密密钥',
        });
        return;
    }
    text2.value = await encryptData(text1.value, webToolPassword);
}

async function onDecrypt() {
    const webToolPassword = localStorage.getItem('webToolPassword');
    if (!webToolPassword) {
        Message.error({
            duration: 10,
            content: '请先设置加密密钥',
        });
        return;
    }
    text2.value = await decryptData(text1.value, webToolPassword);
}
</script>

<style scoped>
.encryption-box {
    padding: 20px;
    display: flex;
    flex-direction: row;
}

.encryption-btn {
    width: 190px;
    padding-top: 200px;
    padding-left: 20px;
}
</style>