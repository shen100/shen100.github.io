<script setup>
import { useRoute } from 'vue-router'
import { RouterView } from 'vue-router'
import { ref, watch } from 'vue'
import Menu from './menu/Menu.vue'
import config from './config/config.js'

const route = useRoute()

const shoudReviewFullPageArr = [
    '/login',
    '/docs',
    '/webtool'
];
let shoudReviewFullPage = ref(false)
let menuVisible = ref(true)
let appName = ref(config.appName)

watch(() => route.path, (newPath) => {
    shoudReviewFullPage.value = shoudReviewFullPageArr.indexOf(newPath) === 0;
}, { immediate: true });
</script>

<template>
    <div id="app-root">
        <div v-if="!shoudReviewFullPage && menuVisible" class="side-menu">
            <div class="logo-dark-box">
                <a href="/" target="_self">
                    <img class="logo-dark" src="./assets/img/logo-small.png">
                    <div class="logo-dark-box-title">{{ appName }}</div>
                </a>
            </div>
            <Menu />
        </div>
        <div v-if="shoudReviewFullPage">
            <RouterView />
        </div>
        <div v-else class="main-content">
            <div class="main-content-layout-header"></div>
            <div class="main-content-layout-content">
                <RouterView :key="route.name"/>
            </div>
        </div>
    </div>
</template>

<style scoped>
#app-root {
    /* height: 100%; */
    overflow-x: hidden;
}

.side-menu {
    height: 100%;
    background-color: #191a23;
    display: inline-block;
    vertical-align: top;
    position: fixed;
}

.logo-dark-box {
    text-align: center;
    padding: 15px 0 0px 0;
}

.side-menu .logo-dark {
    height: 50px;
    display: inline-block;
    vertical-align: top;
}

.side-menu .logo-dark-box a {
    display: block;
}

.logo-dark-box-title {
    display: inline-block;
    vertical-align: top;
    color: #fff;
    line-height: 50px;
    font-size: 22px;
    padding-left: 5px;
    padding-right: 15px;
}

.main-content {
    display: flex;
    flex-direction: row;
    min-height: 100vh;
    padding-left: 240px;
}

.main-content-no-side {
    display: block;
}

.main-content-layout-header {
    width: calc(100% - 240px);
    height: 64px;
    position: fixed;
    left: 240px;
    top: 0;
    right: 0;
    background-color: #fff;
    z-index: 100;
}

.main-content-layout-content {
    padding-top: 64px;
    -webkit-box-flex: 1;
    -ms-flex: auto;
    flex: auto;
    margin-top: 64px;
    padding: 20px;
}
</style>
