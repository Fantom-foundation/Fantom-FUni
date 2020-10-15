<template>
    <div class="f-hamburger-switch" role="switch" :class="[cCssClass, `thickness${thickness}`]" @click="toggle">
        <div class="cont">
            <div class="l1"></div>
            <div v-if="!twoLines" class="l2"></div>
            <div class="l3"></div>
        </div>
    </div>
</template>

<script>
// import events from '../mixins/events.js';

export default {
    // mixins: [events],

    props: {
        /** Is switch on? */
        on: {
            type: Boolean,
            default: false,
        },

        /** Thickness of one switch row. */
        thickness: {
            type: String,
            default: '1',
        },

        /** Use just 2 lines instead of 3. */
        twoLines: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            /** Is switch on? */
            dOn: this.on,
        };
    },

    computed: {
        /**
         * Container's css classes.
         */
        cCssClass() {
            return {
                on: this.dOn,
            };
        },
    },

    watch: {
        dOn() {
            if (this.dOn) {
                this.$emit('hamburger-switch-on');
            } else {
                this.$emit('hamburger-switch-off');
            }
        },
    },

    methods: {
        toggle() {
            this.dOn = !this.dOn;
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
