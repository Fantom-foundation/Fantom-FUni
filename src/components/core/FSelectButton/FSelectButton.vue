<template>
    <button class="f-select-button" :class="[classes, btnClass]">
        <slot></slot>
        <span class="arrow"></span>
    </button>
</template>

<script>
/**
 * Button with look as select element.
 */
export default {
    name: 'FSelectButton',

    props: {
        collapsed: {
            type: Boolean,
            default: false,
        },
        btnClass: {
            type: String,
            default: '',
        },
    },

    computed: {
        /**
         * Container's css classes.
         */
        classes() {
            return {
                collapsed: this.collapsed,
            };
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
