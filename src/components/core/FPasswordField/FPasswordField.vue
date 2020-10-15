<template>
    <span class="f-password-field">
        <f-input ref="input" :type="dType" v-bind="fInputProps" @input="onInput">
            <template #top="sProps">
                <slot name="top" v-bind="sProps"></slot>
            </template>
            <template #prefix="sProps">
                <slot name="prefix" v-bind="sProps"></slot>
            </template>
            <template #suffix="sProps">
                <slot name="suffix" v-bind="sProps">
                    <span @click="onEyeButtonClick">
                        <span
                            v-if="dType === 'password'"
                            class="btn same-size round small light"
                            aria-hidden="true"
                            tabindex="0"
                        >
                            <icon data="@/assets/svg/eye-slash.svg" width="16" height="16" aria-hidden="true" />
                        </span>
                        <span
                            v-if="dType === 'text'"
                            class="btn same-size round small light"
                            aria-hidden="true"
                            tabindex="0"
                        >
                            <icon data="@/assets/svg/eye.svg" width="16" height="16" aria-hidden="true" />
                        </span>
                    </span>
                </slot>
            </template>
            <template #bottom="sProps">
                <slot name="bottom" v-bind="sProps"></slot>
            </template>
        </f-input>
    </span>
</template>

<script>
import { inputMixin } from '../../../mixins/input.js';
import FInput from '../FInput/FInput.vue';

export default {
    components: { FInput },

    mixins: [inputMixin],

    props: {
        ...FInput.props,
    },

    data() {
        return {
            dType: 'password',
        };
    },

    computed: {
        fInputProps() {
            return {
                ...FInput.computed.fInputProps.call(this),
            };
        },
    },

    methods: {
        async validate() {
            await this.$refs.input.validate();
        },

        onEyeButtonClick() {
            if (this.dType === 'password') {
                this.dType = 'text';
            } else {
                this.dType = 'password';
            }
        },

        onInput(_value) {
            this.$emit('input', _value);
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
