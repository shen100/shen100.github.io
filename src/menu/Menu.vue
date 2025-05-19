<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from 'view-ui-plus'
import HttpUtil from '../utils/HttpUtil'
import MenuData from './Menu'

const router = useRouter()

let theme = ref('dark')
let menuList = ref(MenuData);

let urlMap = {};
menuList.value.forEach(function(menu, i) {
    menu.children.forEach(function(subMenu, j) {
        urlMap[`menu-${i}-${j}`] = subMenu.path
    })
});

function onMenuSelect(key) {
    router.push(urlMap[key])
}
</script>

<template>
    <Menu id="side-menu" @on-select="onMenuSelect" theme="dark">
        <Submenu v-for="(menu, i) in menuList" :name="`menu-${i}`">
            <template #title>
                <Icon :type="menu.icon" />
                {{ menu.title }}
            </template>
            <MenuItem v-for="(subMenu, j) in menu.children" :name="`menu-${i}-${j}`">{{ subMenu.title }}</MenuItem>
        </Submenu>
    </Menu>
</template>

<style>
.ivu-menu-item, #side-menu .ivu-menu-item:hover {
    background-color: #101117!important;
}

.ivu-menu-submenu-title, #side-menu .ivu-menu-submenu-title:hover {
    background-color: #191a23!important;
}

#side-menu .ivu-menu-item-selected:hover {
    background: #2d8cf0 !important;
}
</style>
