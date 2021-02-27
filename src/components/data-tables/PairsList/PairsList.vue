<template>
    <div class="pairs-list">
        <div v-if="items.length === 0">No pairs</div>
        <f-data-table
            v-else
            f-card-off
            :columns="columns"
            :items="items"
            :mobile-view="mobileView"
            class="f-data-table-body-bg-color"
        >
            <template v-slot:column-pair="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <f-uniswap-pair-symbol
                            :pair="item"
                            :router-link-to="{
                                name: 'funiswap-pair-detail',
                                params: { pairAddress: item.pairAddress },
                            }"
                        />
                    </div>
                </div>
                <template v-else>
                    <f-uniswap-pair-symbol
                        :pair="item"
                        :router-link-to="{ name: 'funiswap-pair-detail', params: { pairAddress: item.pairAddress } }"
                    />
                </template>
            </template>

            <template v-slot:column-liquidityA="{ value, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <div class="token-liquidity">
                            {{ value._total }}
                            <f-crypto-symbol :token="value" no-symbol img-width="24px" img-height="24px" />
                        </div>
                    </div>
                </div>
                <template v-else>
                    <div class="token-liquidity">
                        {{ value._total }}
                        <f-crypto-symbol :token="value" no-symbol img-width="24px" img-height="24px" />
                    </div>
                </template>
            </template>

            <template v-slot:column-liquidityB="{ value, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <div class="token-liquidity">
                            {{ value._total }}
                            <f-crypto-symbol :token="value" no-symbol img-width="24px" img-height="24px" />
                        </div>
                    </div>
                </div>
                <template v-else>
                    <div class="token-liquidity">
                        {{ value._total }}
                        <f-crypto-symbol :token="value" no-symbol img-width="24px" img-height="24px" />
                    </div>
                </template>
            </template>

            <template v-slot:column-price="{ value, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <template v-if="value[0]._perPrice">
                            {{ value[0]._perPrice.toFixed(4) }}
                            <br />
                            {{ $defi.getTokenSymbol(value[0]) }}/{{ $defi.getTokenSymbol(value[1]) }}
                        </template>
                        <template v-else>0</template>
                    </div>
                </div>
                <template v-else>
                    <template v-if="value[0]._perPrice">
                        {{ value[0]._perPrice.toFixed(4) }}
                        <br />
                        {{ $defi.getTokenSymbol(value[0]) }}/{{ $defi.getTokenSymbol(value[1]) }}
                    </template>
                    <template v-else>0</template>
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
import { defer } from '../../../utils';
import Vue from 'vue';
import FCryptoSymbol from '../../core/FCryptoSymbol/FCryptoSymbol.vue';

export default {
    name: 'PairsList',

    components: { FCryptoSymbol, FTokenValue, FUniswapPairSymbol, FDataTable },

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
                    width: '200px',
                },
                {
                    name: 'liquidityA',
                    label: 'Liquidity A',
                    itemProp: 'tokens',
                    formatter: (_value) => {
                        return _value[0];
                    },
                    css: { textAlign: 'right' },
                },
                {
                    name: 'liquidityB',
                    label: 'Liquidity B',
                    itemProp: 'tokens',
                    formatter: (_value) => {
                        return _value[1];
                    },
                    css: { textAlign: 'right' },
                },
                {
                    name: 'price',
                    label: 'Price',
                    itemProp: 'tokens',
                    formatter: (_value) => {
                        return _value[1].symbol === 'FUSD' ? [_value[1], _value[0]] : _value;
                    },
                    width: '180px',
                    css: { textAlign: 'right' },
                },
                /*
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
                */
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
            /** Stop loading data */
            stopLoading: false,
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        /**
         * Property is set to `true`, if `pairs-list-mobile-view` breakpoint is reached.
         *
         * @return {Boolean}
         */
        mobileView() {
            const dataTableBreakpoint = this.$store.state.breakpoints['pairs-list-mobile-view'];

            return dataTableBreakpoint && dataTableBreakpoint.matches;
        },
    },

    created() {
        this.init();
    },

    beforeDestroy() {
        this.stopLoading = true;
    },

    methods: {
        async init() {
            const { $defi } = this;
            const result = await Promise.all([$defi.fetchUniswapPairs(), $defi.init()]);

            this.items = result[0];

            defer(() => {
                this.updatePositions();
            });

            defer(() => {
                this.updateTokensTotalLiquidity();
            }, 30);
        },

        async updatePositions() {
            const address = this.currentAccount ? this.currentAccount.address : '';

            if (address) {
                this.items = await this.$defi.getUniswapPairsWithShare(address, this.items);
            }
        },

        async updateTokensTotalLiquidity() {
            const { items } = this;
            const { $defi } = this;
            const address = this.currentAccount ? this.currentAccount.address : '';
            let item;
            let pair;
            let tokenA;
            let tokenB;
            let tokenATotal = 0;
            let tokenBTotal = 0;

            for (let i = 0; i < items.length; i++) {
                if (this.stopLoading) {
                    break;
                }

                item = items[i];

                tokenA = item.tokens[0];
                tokenB = item.tokens[1];

                pair = await $defi.fetchUniswapPairs(address, item.pairAddress, [tokenA.address, tokenB.address]);

                tokenATotal = $defi.totalTokenLiquidity(tokenA, pair);
                tokenBTotal = $defi.totalTokenLiquidity(tokenB, pair);

                Vue.set(this.items[i], 'tokens', [
                    {
                        ...tokenA,
                        _total: formatNumberByLocale(tokenATotal, 0),
                        _perPrice: tokenBTotal > 0 ? tokenATotal / tokenBTotal : 0,
                    },
                    {
                        ...tokenB,
                        _total: formatNumberByLocale(tokenBTotal, 0),
                        _perPrice: tokenATotal > 0 ? tokenBTotal / tokenATotal : 0,
                    },
                ]);

                /*
                Vue.set(this.items, i, {
                    ...this.items[i],
                    _tokenATotal: tokenATotal,
                    _tokenBTotal: tokenBTotal,
                });
                */
            }
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

<style lang="scss">
@import 'style';
</style>
