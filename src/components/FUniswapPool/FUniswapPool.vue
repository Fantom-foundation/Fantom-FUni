<template>
    <div class="f-uniswap-pool">
        <pairs-list />
    </div>
</template>

<script>
import PairsList from '@/components/data-tables/PairsList/PairsList.vue';

export default {
    name: 'FUniswapPool',

    components: { PairsList },
};
</script>
