<template>
    <div>
        <div id="compare"></div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loadResource } from '../util/loader';

const route = useRoute();
const router = useRouter()

let data = ref({
});

onMounted(async () => {
    try {
        const hideSidebar = !!route.query.hidesidebar;
        console.log('hideSidebar:', hideSidebar);
        await Promise.all([
            loadResource('/js/mergely.min.js'),
            loadResource('/css/mergely.css'),
        ]);
        const mainContentLayoutHeader = document.querySelector('.main-content-layout-header');
        const headerHeight = mainContentLayoutHeader.offsetHeight;
        const compareDiv = document.getElementById('compare');
        if (!hideSidebar) {
            compareDiv.style.width = (window.innerWidth - 240 - 40) + 'px';
            compareDiv.style.height = (window.innerHeight - headerHeight - 80) + 'px';
        } else {
            compareDiv.style.width = (window.innerWidth - 40) + 'px';
            compareDiv.style.height = (window.innerHeight - headerHeight - 20) + 'px';
            const sidebar = document.querySelector('.side-menu');
            sidebar.style.display = 'none';
            const mainContent = document.querySelector('.main-content');
            mainContent.style.paddingLeft = '0px';
            mainContentLayoutHeader.style.display = 'none';
            const mainContentLayoutContent = document.querySelector('.main-content-layout-content');
            mainContentLayoutContent.style.marginTop = '0';
        }
        const doc = new Mergely('#compare', {
        });
    } catch (error) {
        console.error('资源加载出错:', error);
    }
});
</script>

<style>
.mergely-splash {
    display: none;
}

.mergely-editor .mergely.c.CodeMirror-linebackground {
    background-color: #fff!important;
}

/* .mergely-editor .mergely.ch.ind.lhs {
    color: rgb(243, 224, 50)!important;
} */

.mergely-editor .mergely.ch.ina.rhs {
    color: rgb(113, 113, 113)!important;
    background-color: #ddeeff;
}
</style>
