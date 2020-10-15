<template>
    <span class="f-back-button" @click="onClick">
        <slot>
            <button class="btn light large same-size round" title="Back">
                <icon data="@/assets/svg/arrow-left.svg" aria-hidden="true" />
            </button>
        </slot>
    </span>
</template>

<script>
export default {
    name: 'FBackButton',

    props: {
        routeName: {
            type: String,
            default: '',
        },
        params: {
            type: Object,
            default() {
                return {};
            },
        },
    },

    methods: {
        onClick() {
            if (this.routeName) {
                this.$router.replace({ name: this.routeName, params: this.params });
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
