<template>
    <footer class="f-footer">
        <toolbar v-if="mobileView" />
    </footer>
</template>

<script>
import Toolbar from '@/components/Toolbar/Toolbar.vue';

export default {
    components: { Toolbar },

    computed: {
        /**
         * Property is set to `true`, if 'menu-mobile' breakpoint is reached.
         *
         * @return {Boolean}
         */
        mobileView() {
            const menuMobileBreakpoint = this.$store.state.breakpoints['menu-mobile'];

            return menuMobileBreakpoint && menuMobileBreakpoint.matches;
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
