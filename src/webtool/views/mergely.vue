<template>
    <div class="compare-box">
        <div id="compare"></div>
    </div>
</template>

<script setup>
/*
 * Mergely Diff Tool
 * https://github.com/wickedest/Mergely
 */
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loadResource } from '../util/loader';

const route = useRoute();
const router = useRouter()

let data = ref({
});

onMounted(async () => {
    try {
        await Promise.all([
            loadResource('/js/mergely.min.js'),
            loadResource('/css/mergely.css'),
        ]);
        const compareDiv = document.getElementById('compare');
        compareDiv.style.width = (window.innerWidth - 40) + 'px';
        compareDiv.style.height = (window.innerHeight - 40) + 'px';
        const doc = new Mergely('#compare', {
        });
    } catch (error) {
        console.error('资源加载出错:', error);
    }
});
</script>

<style>
.compare-box {
    padding: 20px;
}

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
