<template>
    <span :id="id" class="btn f-file-input-btn" tabindex="0" role="button">
        <input
            :id="cId"
            type="file"
            tabindex="-1"
            :accept="accept"
            v-bind="inputProps"
            @change="onFFileInputButtonChange"
        />
        <label :for="cId"><slot></slot></label>
    </span>
</template>

<script>
import { inputMixin } from '../../../mixins/input.js';

export default {
    mixins: [inputMixin],

    props: {
        /**
         * SDfqwer poiuwf
         */
        accept: {
            type: String,
            default: '',
        },
    },

    computed: {
        cId() {
            return this.id + '-fi';
        },
    },

    methods: {
        onFFileInputButtonChange(_event) {
            this.$emit('change', _event);
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
