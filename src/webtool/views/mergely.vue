<template>
    <div>
        <div id="compare"></div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { loadResource } from '../util/loader';

const router = useRouter()

let data = ref({
});

onMounted(async () => {
    try {
        await Promise.all([
            loadResource('https://cdnjs.cloudflare.com/ajax/libs/mergely/5.0.0/mergely.min.js'),
            loadResource('https://cdnjs.cloudflare.com/ajax/libs/mergely/5.0.0/mergely.css'),
        ]);
        const header = document.querySelector('.main-content-layout-header');
        const headerHeight = header.offsetHeight;
        const compareDiv = document.getElementById('compare');
        compareDiv.style.width = (window.innerWidth - 240 - 40) + 'px';
        compareDiv.style.height = (window.innerHeight - headerHeight - 80) + 'px';
        console.log('Header height:', headerHeight);
        console.log('Window height:', window.innerHeight);
        console.log('Compare div height:', compareDiv.style.height);

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
