<script setup>
import { ref } from 'vue'
import { Message } from 'view-ui-plus'
import config from '../config/config'

const props = defineProps(['path'])

let url = ref('')

if (location.hostname === 'localhost') {
    url = 'http://localhost:' + config.serverPort;
}
</script>

<template>
    <a :href="`${url}${props.path}`" download>
        <slot></slot>
    </a>
</template>

<style scoped>
</style>