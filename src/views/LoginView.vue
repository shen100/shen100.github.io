<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from 'view-ui-plus'
import HttpUtil from '../utils/HttpUtil'
import config from '../config/config.js'
import ErrorCode from '../config/ErrorCode';

const route = useRoute()
const router = useRouter()

let username = ref('')
let password = ref('')
let year = ref(new Date().getFullYear())
let appName = ref(config.appName)

onMounted(async () => {
    localStorage.setItem('token', '');
    await nextTick()
    if (route.query.code === ErrorCode.INVALID_TOKEN + '') {
        Message.error({
            duration: 10,
            content: '无效的token'
        });
    }
    if (route.query.code === ErrorCode.TOKEN_EXPIRE + '') {
        Message.error({
            duration: 10,
            content: 'token过期，请重新登录'
        });
    }
})

async function onLogin() {
    const reqData = {
        username: username.value,
        password: password.value
    };
    let res
    try {
        res = await HttpUtil.post('/api/login', reqData)
        if (res.code !== 0) {
            Message.error({
                duration: 10,
                content: res.message
            });
            return
        }
        localStorage.setItem('token', res.data.token);
        router.push({ path: '/dashboard/console' })
    } catch (err) {
        console.error(err);
        Message.error({
            duration: 10,
            content: err.message
        });
    }
}
</script>

<template>
    <div class="page-account">
        <div class="page-account-container">
            <div class="page-account-top">
                <div class="page-account-top-logo">
                    <div class="logo-title-box">
                        <img src="../assets/img/logo-small.png" alt="logo">
                        <div class="logo-title-box-title">{{ appName }}</div>
                    </div>
                    <div class="page-account-top-desc">{{ appName }} - 简单、有趣的单词记忆程序</div>
                </div>
            </div>
            <div>
                <Form label-position="left" :label-width="1">
                    <FormItem label="">
                        <Input v-model="username" size="large" prefix="ios-contact-outline" placeholder="请输入用户名" />
                    </FormItem>
                    <FormItem label="">
                        <Input v-model="password" type="password" size="large" prefix="ios-lock-outline" placeholder="请输入密码" />
                    </FormItem>
                    <FormItem label="">
                        <Button @click="onLogin" type="primary" size="large" long>登录</Button>
                    </FormItem>
                </Form>
            </div>
            <div class="ivu-global-footer i-copyright">
                <div class="ivu-global-footer-copyright">Copyright © {{ year }} All Rights Reserved</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-account {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    height: 100vh;
    overflow: auto;
}

@media (min-width: 768px) {
    .page-account:after, .page-account:before {
        content: "";
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        right: 50%;
        bottom: 0;
        z-index: -1;
        background-image: url(../assets/img/bg-login-left.png);
        background-repeat: no-repeat;
        background-position: bottom;
        background-size: 100%;
    }
}

@media (min-width: 768px) {
    .page-account:after {
        left: 50%;
        right: 0;
        background-image: url(../assets/img/bg-login-right.png);
    }
}

.page-account-container {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    padding: 32px 0;
    text-align: center;
    width: 384px;
    margin: 0 auto;
}

@media (min-width: 768px) {
    .page-account-container {
        padding: 32px 0 24px 0;
    }
}

.page-account-top {
    padding: 100px 0 32px 0;
}

.page-account-top-logo img {
    height: 75px;
}

.page-account-top-desc {
    font-size: 14px;
    color: #808695;
}

.ivu-global-footer {
    margin: 48px 0 24px 0;
    padding: 0 16px;
    text-align: center;
    position: fixed;
    bottom: 0;
    width: 384px;
}

.i-copyright {
    -webkit-box-flex: 0;
    -ms-flex: 0 0 auto;
    flex: 0 0 auto;
}

.ivu-global-footer-copyright {
    color: #808695;
    font-size: 14px;
}

.logo-title-box img {
    display: inline-block;
    vertical-align: top;
}

.logo-title-box-title {
    font-size: 32px;
    color: #000;
    margin-left: 0px;
    line-height: 75px;
    display: inline-block;
    vertical-align: top;
}
</style>