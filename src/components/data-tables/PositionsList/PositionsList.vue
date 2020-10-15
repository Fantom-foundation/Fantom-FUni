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

            <template v-slot:column-amount="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <template v-if="item._collateral > 0">{{ formatCollateral(item) }}</template>
                        <template v-if="item._debt > 0">{{ formatDebt(item) }}</template>
                    </div>
                </div>
                <template v-else>
                    <template v-if="item._collateral > 0">{{ formatCollateral(item) }}</template>
                    <template v-if="item._debt > 0">{{ formatDebt(item) }}</template>
                </template>
            </template>

            <template v-slot:column-amount_fusd="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <template v-if="item._collateral > 0">{{ formatCollateralFUSD(item) }}</template>
                        <template v-if="item._debt > 0">{{ formatDebtFUSD(item) }}</template>
                    </div>
                </div>
                <template v-else>
                    <template v-if="item._collateral > 0">{{ formatCollateralFUSD(item) }}</template>
                    <template v-if="item._debt > 0">{{ formatDebtFUSD(item) }}</template>
                </template>
            </template>

            <template v-slot:column-rewards="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <template v-if="canClaimRewards(item.rewards)">
                            <f-token-value
                                no-currency
                                :use-placeholder="false"
                                :token="wftmToken"
                                :value="pendingRewardsWFTM(item.rewards) - stashedRewardsWFTM(item.rewards)"
                            />
                            <span class="currency-light">
                                /
                                <f-token-value
                                    :use-placeholder="false"
                                    :token="wftmToken"
                                    :value="stashedRewardsWFTM(item.rewards)"
                                />
                            </span>
                        </template>
                        <template v-else>-</template>
                    </div>
                </div>
                <template v-else>
                    <template v-if="canClaimRewards(item.rewards)">
                        <f-token-value
                            no-currency
                            :use-placeholder="false"
                            :token="wftmToken"
                            :value="pendingRewardsWFTM(item.rewards) - stashedRewardsWFTM(item.rewards)"
                        />
                        <span class="currency-light">
                            /
                            <f-token-value
                                :use-placeholder="false"
                                :token="wftmToken"
                                :value="stashedRewardsWFTM(item.rewards)"
                            />
                        </span>
                    </template>
                    <template v-else>-</template>
                </template>
            </template>

            <template v-slot:column-actions="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <template v-if="item._collateral > 0">
                            <template v-if="usedInFMint(item) && item.symbol === 'WFTM'">
                                <router-link :to="{ name: 'defi-lock' }">Lock</router-link>,
                                <router-link :to="{ name: 'defi-unlock' }">Unlock</router-link>,
                                <router-link :to="{ name: 'defi-ftrade' }">Swap</router-link>
                            </template>
                        </template>
                        <template v-if="item._debt > 0">
                            <template v-if="usedInFMint(item) && item.symbol === 'FUSD'">
                                <router-link :to="{ name: 'defi-mint' }">Mint</router-link>,
                                <router-link :to="{ name: 'defi-repay' }">Repay</router-link>
                            </template>
                        </template>
                        <template v-if="canClaimRewards(item.rewards)">
                            ,<router-link
                                v-if="canClaimRewards"
                                :to="{
                                    name: 'defi-fmint-claim-rewards-confirmation',
                                    params: {
                                        pendingRewards: pendingRewardsWFTM(item.rewards),
                                        token: { ...wftmToken },
                                    },
                                }"
                            >
                                Claim
                            </router-link>
                        </template>
                    </div>
                </div>
                <template v-else>
                    <template v-if="item._collateral > 0">
                        <template v-if="usedInFMint(item) && item.symbol === 'WFTM'">
                            <router-link :to="{ name: 'defi-lock' }">Lock</router-link>
                            <br />
                            <router-link :to="{ name: 'defi-unlock' }">Unlock</router-link>
                            <br />
                            <router-link :to="{ name: 'defi-ftrade' }">Swap</router-link>
                        </template>
                    </template>
                    <template v-if="item._debt > 0">
                        <template v-if="usedInFMint(item) && item.symbol === 'FUSD'">
                            <router-link :to="{ name: 'defi-mint' }">Mint</router-link>
                            <br />
                            <router-link :to="{ name: 'defi-repay' }">Repay</router-link>
                        </template>
                    </template>
                    <template v-if="canClaimRewards(item.rewards)">
                        <br />
                        <router-link
                            v-if="canClaimRewards"
                            :to="{
                                name: 'defi-fmint-claim-rewards-confirmation',
                                params: { pendingRewards: pendingRewardsWFTM(item.rewards), token: { ...wftmToken } },
                            }"
                        >
                            Claim
                        </router-link>
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
import { mapGetters } from 'vuex';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';

export default {
    name: 'PositionsList',

    components: { FTokenValue, DepositOrBorrowTokenWindow, FCryptoSymbol, FDataTable },

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
            /** @type {DefiToken} */
            wftmToken: {},
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
                    name: 'amount',
                    label: 'Amount',
                    css: { textAlign: 'center' },
                },
                {
                    name: 'amount_fusd',
                    label: 'Amount (fUSD)',
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
                    css: { textAlign: 'center' },
                },
                {
                    name: 'rewards',
                    label: 'Est. Pending / Stashed Rewards',
                    css: { textAlign: 'center' },
                },
                {
                    name: 'type',
                    label: 'Type',
                    formatter: (_foo, _token) => {
                        let type = [];

                        if (_token._collateral > 0) {
                            if (this.usedInFMint(_token)) {
                                type.push('lock');
                            } else {
                                type.push('deposit');
                            }
                        }

                        if (_token._debt > 0) {
                            if (this.usedInFMint(_token)) {
                                type.push('mint');
                            } else {
                                type.push('borrow');
                            }
                        }

                        return type.join(', ');
                    },
                    width: '160px',
                    css: { textAlign: 'center' },
                },
                {
                    name: 'actions',
                    label: 'Actions',
                    width: '180px',
                    css: { textAlign: 'right' },
                },
            ],
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),
    },

    watch: {
        /**
         * @param {DefiToken[]} _value
         */
        async tokens(_value) {
            let tokens = _value.filter((_item) => _item.isActive && _item.canDeposit && _item.symbol !== 'FTM');

            this.wftmToken = _value.find((_item) => _item.symbol === 'WFTM');

            const items = tokens.filter((_item) => {
                const collateral = this.getCollateral(_item);
                const debt = this.getDebt(_item);

                // store collateral and debt for later use
                _item._collateral = collateral;
                _item._debt = debt;

                return collateral !== 0 || debt !== 0;
            });

            await this.setRewards(items);

            this.items = items;

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

        async setRewards(_items) {
            for (let i = 0, len1 = _items.length; i < len1; i++) {
                if (_items[i].symbol === 'FUSD') {
                    _items[i].rewards = await this.$defi.fetchFMintAccountRewards(this.currentAccount.address);
                    break;
                }
            }
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

        /**
         * @param {DefiToken} _token
         * @return {boolean}
         */
        usedInFMint(_token) {
            return _token.symbol === 'WFTM' || _token.symbol === 'FUSD';
        },

        /**
         * @param {object} _rewards
         * @return {boolean}
         */
        canClaimRewards(_rewards) {
            return (
                _rewards &&
                _rewards.canClaimRewards &&
                (_rewards.rewardsEarned !== '0x0' || _rewards.rewardsStashed !== '0x0')
            );
        },

        /**
         * @param {object} _rewards
         */
        pendingRewardsWFTM(_rewards) {
            return this.$defi.fromTokenValue(_rewards.rewardsEarned, this.wftmToken) || 0;
        },

        /**
         * @param {object} _rewards
         */
        stashedRewardsWFTM(_rewards) {
            return this.$defi.fromTokenValue(_rewards.rewardsStashed, this.wftmToken) || 0;
        },

        /**
         * @param {DefiToken} _item
         */
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
