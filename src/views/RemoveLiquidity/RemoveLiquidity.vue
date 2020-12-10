<template>
    <div class="view-remove-liquidity">
        <f-view-transition watch-route :views-structure="viewsStructure">
            <router-view :key="routerKey"></router-view>
        </f-view-transition>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import FViewTransition from '@/components/core/FViewTransition/FViewTransition.vue';
import { appStructureTree } from '@/app-structure.js';
import { getUniqueId } from '@/utils';

export default {
    name: 'RemoveLiquidity',

    components: { FViewTransition },

    data() {
        return {
            routerKey: getUniqueId(),
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        viewsStructure() {
            const node = appStructureTree.serialize(appStructureTree.get('remove-liquidity'));

            return node ? [JSON.parse(node)] : [];
        },
    },

    watch: {
        currentAccount(_value, _oldValue) {
            if (!_oldValue || !_value || _value.address !== _oldValue.address) {
                this.routerKey = getUniqueId();
            }
        },
    },
};
</script>

<!--
<style lang="scss">
@import 'style';
</style>
-->
