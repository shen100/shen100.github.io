<script setup>
import { ref } from 'vue'
import config from '../config/config'

const props = defineProps([
    'path',
    'headers',
    'show-upload-list',
    'on-success',
    'on-error'
])

let uploadUrl = ref('')

if (location.hostname === 'localhost') {
    uploadUrl = 'http://localhost:' + config.serverPort;
}

function onSuccess() {
    if (props['on-success']) {
        props['on-success'].apply(null, arguments);
    }
    if (props.onSuccess) {
        props.onSuccess.apply(null, arguments);
    }
}

function onError() {
    if (props['on-error']) {
        props['on-error'].apply(null, arguments);
    }
    if (props.onError) {
        props.onError.apply(null, arguments);
    }
}
</script>

<template>
    <Upload name="upFile" :action="`${uploadUrl}${props.path}`"
        :show-upload-list="!!props['show-upload-list'] || !!props.showUploadList"
        :headers="props.headers"
        :on-success="onSuccess"
        :on-error="onError">
        <slot></slot>
    </Upload>
</template>