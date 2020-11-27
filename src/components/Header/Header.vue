<template>
    <header class="f-header">
        <router-link to="/" class="f-header__logo" aria-label="Home">
            <icon data="@/assets/svg/funiswap_black.svg" width="32" height="32" original aria-hidden="true" />
        </router-link>
        <f-simple-navigation :items="navigation"></f-simple-navigation>
        <toolbar v-if="!mobileView" />
    </header>
</template>

<script>
import FSimpleNavigation from '@/components/core/FSimpleNavigation/FSimpleNavigation.vue';
import Toolbar from '@/components/Toolbar/Toolbar.vue';

/**
 * Renderes header and takes care of navigation.
 */
export default {
    components: { Toolbar, FSimpleNavigation },

    data() {
        return {
            /** Navigation items. */
            navigation: [
                {
                    url: {
                        name: 'funiswap-swap',
                    },
                    title: 'Swap',
                },
                {
                    url: {
                        name: 'funiswap-pools',
                    },
                    title: 'Pools',
                },
                {
                    url: {
                        name: 'funiswap-wrap-ftm',
                    },
                    title: 'Wrap FTM',
                },
            ],
        };
    },

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
