<template>
    <div class="pairs-list">
        <div v-if="items.length === 0">No pairs</div>
        <f-data-table
            v-else
            f-card-off
            :columns="columns"
            :items="items"
            class="f-data-table-body-bg-color"
            action-on-row__
            @row-action__="onRowAction"
        >
            <template v-slot:column-pair="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <f-crypto-symbol :token="item.tokens[0]" />
                        <f-crypto-symbol :token="item.tokens[1]" />
                    </div>
                </div>
                <template v-else>
                    <f-crypto-symbol :token="item.tokens[0]" />
                    <f-crypto-symbol :token="item.tokens[1]" />
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
                                name: 'funiswap-remove-liquidity',
                                params: { tokena: item.tokens[0].address, tokenb: item.tokens[1].address },
                            }"
                        >
                            Remove Liquidity
                        </router-link>
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
                            name: 'funiswap-remove-liquidity',
                            params: { tokena: item.tokens[0].address, tokenb: item.tokens[1].address },
                        }"
                    >
                        Remove Liquidity
                    </router-link>
                </template>
            </template>
        </f-data-table>
    </div>
</template>

<script>
import FDataTable from '@/components/core/FDataTable/FDataTable.vue';
import FCryptoSymbol from '@/components/core/FCryptoSymbol/FCryptoSymbol.vue';
import { formatNumberByLocale } from '@/filters.js';

export default {
    name: 'PairsList',

    components: { FCryptoSymbol, FDataTable },

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
                },
                {
                    name: 'actions',
                    label: 'Actions',
                    css: { textAlign: 'right' },
                },
                /*
                {
                    name: 'asset',
                    label: 'Asset',
                    sortFunc: (_itemProp, _direction = 'asc') => {
                        return (_a, _b) => {
                            const a = _a.symbol;
                            const b = _b.symbol;

                            return (_direction === 'desc' ? -1 : 1) * stringSort(a, b);
                        };
                    },
                    sortDir: 'desc',
                    width: '140px',
                },
                {
                    name: 'available',
                    label: 'Available',
                    itemProp: 'availableBalance',
                    formatter: (_value, _item) => {
                        const balance = _item._availableBalance;

                        return balance > 0 ? formatNumberByLocale(balance, this.defi.getTokenDecimals(_item)) : 0;
                    },
                    css: { textAlign: 'right' },
                    // width: '100px',
                },
                {
                    name: 'deposited',
                    label: 'Deposited',
                    itemProp: 'availableBalance',
                    formatter: (_value, _item) => {
                        const collateral = _item._deposited;

                        return collateral > 0 ? formatNumberByLocale(collateral, this.defi.getTokenDecimals(_item)) : 0;
                    },
                    css: { textAlign: 'right' },
                    // width: '100px',
                },
                {
                    name: 'borrowed',
                    label: 'Borrowed',
                    // hidden: true,
                    formatter: (_value, _item) => {
                        const debt = _item._debt;

                        return debt > 0 ? formatNumberByLocale(debt, this.defi.getTokenDecimals(_item)) : 0;
                    },
                    css: { textAlign: 'right' },
                },
                {
                    name: 'actions-account',
                    label: 'Actions',
                    width: '120px',
                    css: { textAlign: 'right' },
                },
*/
            ],
        };
    },

    created() {
        this.init();
    },

    methods: {
        async init() {
            const { $defi } = this;
            const result = await Promise.all([$defi.fetchUniswapPairs(), $defi.init()]);
            const pairs = result[0];

            this.items = pairs;
            console.log(pairs);
        },

        onRowAction(_pair) {
            console.log('jo', _pair);
        },
    },
};
</script>
