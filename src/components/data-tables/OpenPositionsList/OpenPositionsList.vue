<template>
    <div class="open-positions-list-dt">
        <f-data-table
            :columns="columns"
            :items="items"
            :action-on-row="actionOnRow"
            first-m-v-column-width="6"
            f-card-off
            class="f-data-table-body-bg-color"
            @row-action="onRowAction"
        >
            <template v-slot:column-asset="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <f-crypto-symbol :token="item" />
                    </div>
                </div>
                <template v-else>
                    <f-crypto-symbol :token="item" />
                </template>
            </template>

            <template v-slot:column-balance="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <template v-if="item._collateral > 0">
                            depo.: <b>{{ formatCollateral(item) }} </b>
                            <!--<span class="currency-light">{{ $defi.getTokenSymbol(item) }}</span> --><br />
                        </template>
                        <template v-if="item._debt > 0">
                            borr.: <b>{{ formatDebt(item) }} </b>
                            <!--<span class="currency-light">{{ $defi.getTokenSymbol(item) }}</span>-->
                        </template>
                    </div>
                </div>
                <template v-else>
                    <template v-if="item._collateral > 0">
                        depo.: <b>{{ formatCollateral(item) }} </b>
                        <!--<span class="currency-light">{{ $defi.getTokenSymbol(item) }}</span> --><br />
                    </template>
                    <template v-if="item._debt > 0">
                        borr.: <b>{{ formatDebt(item) }} </b>
                        <!--<span class="currency-light">{{ $defi.getTokenSymbol(item) }}</span>-->
                    </template>
                </template>
            </template>

            <template v-slot:column-balance_fusd="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <template v-if="item._collateral > 0">
                            depo.: <b>{{ formatCollateralFUSD(item) }}</b> <br />
                        </template>
                        <template v-if="item._debt > 0">
                            borr.: <b>{{ formatDebtFUSD(item) }}</b>
                        </template>
                    </div>
                </div>
                <template v-else>
                    <template v-if="item._collateral > 0">
                        depo.: <b>{{ formatCollateralFUSD(item) }}</b> <br />
                    </template>
                    <template v-if="item._debt > 0">
                        borr.: <b>{{ formatDebtFUSD(item) }}</b>
                    </template>
                </template>
            </template>
        </f-data-table>

        <deposit-or-borrow-token-window
            ref="win"
            :token="dbToken"
            :deposit-route-name="depositRouteName"
            :borrow-route-name="borrowRouteName"
        />
    </div>
</template>

<script>
import FDataTable from '@/components/core/FDataTable/FDataTable.vue';
import FCryptoSymbol from '@/components/core/FCryptoSymbol/FCryptoSymbol.vue';
import { numberSort, stringSort } from '@/utils/array-sorting.js';
import DepositOrBorrowTokenWindow from '@/components/windows/DepositOrBorrowTokenWindow/DepositOrBorrowTokenWindow.vue';
import { formatNumberByLocale } from '@/filters.js';

export default {
    name: 'OpenPositionsList',

    components: { DepositOrBorrowTokenWindow, FCryptoSymbol, FDataTable },

    props: {
        /** @type {DefiToken[]} */
        tokens: {
            type: Array,
            required: true,
            default() {
                return [];
            },
        },
        /** @type {FMintAccount} */
        fMintAccount: {
            type: Object,
            default() {
                return {
                    collateral: [],
                    debt: [],
                };
            },
        },
        depositRouteName: {
            type: String,
            default: 'defi-manage-deposit',
        },
        borrowRouteName: {
            type: String,
            default: 'defi-manage-borrow',
        },
        /** If `true`, row will become clickable. */
        actionOnRow: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            items: [],
            /** @type {DeFi} */
            defi: this.$defi,
            /** Token used in <deposit-or-borrow-token-window> */
            dbToken: {},
            columns: [
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
                    width: '140px',
                },
                {
                    name: 'balance',
                    label: 'Position',
                    // css: { textAlign: 'right' },
                },
                {
                    name: 'balance_fusd',
                    label: 'Position (fUSD)',
                    sortDir: 'desc',
                    sortFunc: (_itemProp, _direction = 'asc') => {
                        return (_a, _b) => {
                            const aTokenPrice = this.defi.getTokenPrice(_a);
                            const a = this.getDebt(_a) * aTokenPrice + this.getCollateral(_a) * aTokenPrice;
                            const bTokenPrice = this.defi.getTokenPrice(_b);
                            const b = this.getDebt(_b) * bTokenPrice + this.getCollateral(_b) * bTokenPrice;

                            return (_direction === 'desc' ? -1 : 1) * numberSort(a, b);
                        };
                    },
                    // css: { textAlign: 'right' },
                },
            ],
        };
    },

    watch: {
        /**
         * @param {DefiToken[]} _value
         */
        tokens(_value) {
            const items = _value.filter((_item) => _item.isActive && _item.canDeposit && _item.symbol !== 'FTM');

            this.items = items.filter((_item) => {
                const collateral = this.getCollateral(_item);
                const debt = this.getDebt(_item);

                // store collateral and debt for later use
                _item._collateral = collateral;
                _item._debt = debt;

                return collateral !== 0 || debt !== 0;
            });

            this.$emit('records-count', this.items.length);
        },
    },

    methods: {
        /**
         * @param {DefiToken} _token
         * @return {*|number}
         */
        getDebt(_token) {
            /** @type {FMintTokenBalance} */
            const tokenBalance = this.$defi.getFMintAccountDebt(this.fMintAccount, _token);

            return this.$defi.fromTokenValue(tokenBalance.balance, _token) || 0;
        },

        /**
         * @param {DefiToken} _token
         * @return {*|number}
         */
        formatDebt(_token) {
            const debt = '_debt' in _token ? _token._debt : this.getDebt(_token);

            return debt > 0 ? formatNumberByLocale(debt, this.defi.getTokenDecimals(_token)) : 0;
        },

        /**
         * @param {DefiToken} _token
         * @return {*|number}
         */
        formatDebtFUSD(_token) {
            const debt = this.getDebt(_token);

            return debt > 0
                ? formatNumberByLocale(
                      debt * this.defi.getTokenPrice(_token),
                      this.defi.getTokenDecimals({ symbol: 'FUSD' })
                  )
                : 0;
        },

        /**
         * @param {DefiToken} _token
         * @return {*|number}
         */
        getCollateral(_token) {
            /** @type {FMintTokenBalance} */
            const tokenBalance = this.$defi.getFMintAccountCollateral(this.fMintAccount, _token);

            return this.$defi.fromTokenValue(tokenBalance.balance, _token) || 0;
        },

        /**
         * @param {DefiToken} _token
         * @return {*|number}
         */
        formatCollateral(_token) {
            const collateral = '_collateral' in _token ? _token._collateral : this.getCollateral(_token);

            return collateral > 0 ? formatNumberByLocale(collateral, this.defi.getTokenDecimals(_token)) : 0;
        },

        /**
         * @param {DefiToken} _token
         * @return {*|number}
         */
        formatCollateralFUSD(_token) {
            const collateral = this.getCollateral(_token);

            return collateral > 0
                ? formatNumberByLocale(
                      collateral * this.defi.getTokenPrice(_token),
                      this.defi.getTokenDecimals({ symbol: 'FUSD' })
                  )
                : 0;
        },

        onRowAction(_item) {
            if (_item._debt > 0 && _item._collateral > 0) {
                this.dbToken = _item;
                this.$refs.win.show();
            } else if (_item._debt > 0) {
                this.$router.push({ name: this.borrowRouteName, params: { token: { ..._item } } });
            } else if (_item._collateral > 0) {
                this.$router.push({ name: this.depositRouteName, params: { token: { ..._item } } });
            }
        },
    },
};
</script>
