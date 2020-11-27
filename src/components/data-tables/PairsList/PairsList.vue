<template>
    <div class="pairs-list">
        <div v-if="items.length === 0">No pairs</div>
        <f-data-table v-else f-card-off :columns="columns" :items="items" class="f-data-table-body-bg-color">
            <template v-slot:column-pair="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <f-uniswap-pair-symbol :pair="item" />
                    </div>
                </div>
                <template v-else>
                    <f-uniswap-pair-symbol :pair="item" />
                </template>
            </template>

            <template v-slot:column-position="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <template v-if="getPairShare(item) > 0">
                            <f-token-value :token="item.tokens[0]" :value="getTokenShare(item, 0)" />
                            <br />
                            <f-token-value :token="item.tokens[1]" :value="getTokenShare(item, 1)" />
                        </template>
                        <template v-else> - </template>
                    </div>
                </div>
                <template v-else>
                    <template v-if="getPairShare(item) > 0">
                        <f-token-value :token="item.tokens[0]" :value="getTokenShare(item, 0)" />
                        <br />
                        <f-token-value :token="item.tokens[1]" :value="getTokenShare(item, 1)" />
                    </template>
                    <template v-else> - </template>
                </template>
            </template>

            <template v-slot:column-actions="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <router-link
                            :to="{
                                name: 'funiswap-add-liquidity',
                                params: { tokena: item.tokens[0].address, tokenb: item.tokens[1].address },
                            }"
                        >
                            Add Liquidity
                        </router-link>
                        ,
                        <router-link
                            :to="{
                                name: 'funiswap-swap',
                                params: { tokena: item.tokens[0].address, tokenb: item.tokens[1].address },
                            }"
                        >
                            Swap
                        </router-link>
                        <template v-if="item.shareOf && item.shareOf !== '0x0'">
                            ,
                            <router-link
                                :to="{
                                    name: 'funiswap-remove-liquidity',
                                    params: { tokena: item.tokens[0].address, tokenb: item.tokens[1].address },
                                }"
                            >
                                Remove Liquidity
                            </router-link>
                        </template>
                    </div>
                </div>
                <template v-else>
                    <router-link
                        :to="{
                            name: 'funiswap-add-liquidity',
                            params: { tokena: item.tokens[0].address, tokenb: item.tokens[1].address },
                        }"
                    >
                        Add Liquidity
                    </router-link>
                    <br />
                    <router-link
                        :to="{
                            name: 'funiswap-swap',
                            params: { tokena: item.tokens[0].address, tokenb: item.tokens[1].address },
                        }"
                    >
                        Swap
                    </router-link>
                    <template v-if="item.shareOf && item.shareOf !== '0x0'">
                        <br />
                        <router-link
                            :to="{
                                name: 'funiswap-remove-liquidity',
                                params: { tokena: item.tokens[0].address, tokenb: item.tokens[1].address },
                            }"
                        >
                            Remove Liquidity
                        </router-link>
                    </template>
                </template>
            </template>
        </f-data-table>
    </div>
</template>

<script>
import FDataTable from '@/components/core/FDataTable/FDataTable.vue';
import { formatNumberByLocale } from '@/filters.js';
import FUniswapPairSymbol from '@/components/FUniswapPairSymbol/FUniswapPairSymbol.vue';
import { mapGetters } from 'vuex';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';

export default {
    name: 'PairsList',

    components: { FTokenValue, FUniswapPairSymbol, FDataTable },

    data() {
        return {
            items: [],
            /** @type {DeFi} */
            defi: this.$defi,
            columns: [
                {
                    name: 'pair',
                    label: 'Pair',
                    itemProp: 'pairAddress',
                },
                {
                    name: 'totalSupply',
                    label: 'Total Supply',
                    formatter: (_value, _item) => {
                        const token = _item.tokens[0];

                        return formatNumberByLocale(
                            this.$defi.fromTokenValue(_value, token),
                            this.defi.getTokenDecimals(token)
                        );
                    },
                    css: { textAlign: 'center' },
                },
                {
                    name: 'position',
                    label: 'Your Position',
                    css: { textAlign: 'center' },
                },
                {
                    name: 'actions',
                    label: 'Actions',
                    css: { textAlign: 'right' },
                },
            ],
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),
    },

    created() {
        this.init();
    },

    methods: {
        async init() {
            const { $defi } = this;
            const result = await Promise.all([$defi.fetchUniswapPairs(), $defi.init()]);

            this.items = result[0];

            setTimeout(async () => {
                const address = this.currentAccount ? this.currentAccount.address : '';
                if (address) {
                    this.items = await $defi.getUniswapPairsWithShare(address, this.items);
                }
            }, 30);
        },

        /**
         * @param {UniswapPair} _pair
         * @param {number} [_tokenIdx]
         * @return {number}
         */
        getTokenShare(_pair, _tokenIdx = 0) {
            const share = this.getPairShare(_pair);

            if (share > 0) {
                return this.$defi.fromTokenValue(_pair.reserves[_tokenIdx], _pair.tokens[_tokenIdx]) * share;
            }

            return 0;
        },

        /**
         * @param {UniswapPair} _pair
         * @return {number}
         */
        getPairShare(_pair) {
            const share = _pair && _pair.shareOf ? _pair.shareOf : '0x0';

            return _pair.pairAddress && share !== '0x0' ? parseInt(share, 16) / parseInt(_pair.totalSupply, 16) : 0;
        },
    },
};
</script>
