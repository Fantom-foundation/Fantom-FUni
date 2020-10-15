<template>
    <div class="fmint-overview-list-dt">
        <f-data-table
            :columns="columns"
            :items="items"
            :action-on-row="actionOnRow"
            :loading="loading"
            :force-loading="true"
            first-m-v-column-width="6"
            f-card-off
            class="f-data-table-body-bg-color"
            @row-action="onRowAction"
        >
            <template v-slot:column-accountName="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col-7">
                        <template v-if="value">{{ value }}</template>
                        <template v-else><f-ellipsis :text="item.accountAddress" overflow="middle" /></template>
                    </div>
                </div>
                <template v-else>
                    <template v-if="value">{{ value }}</template>
                    <template v-else><f-ellipsis :text="item.accountAddress" overflow="middle" /></template>
                </template>
            </template>

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
                        <template v-if="item._collateral > 0">{{
                            formatCollateral(item, item._fMintAccount)
                        }}</template>
                        <template v-if="item._debt > 0">{{ formatDebt(item) }}</template>
                    </div>
                </div>
                <template v-else>
                    <template v-if="item._collateral > 0">{{ formatCollateral(item, item._fMintAccount) }}</template>
                    <template v-if="item._debt > 0">{{ formatDebt(item, item._fMintAccount) }}</template>
                </template>
            </template>

            <template v-slot:column-cratio="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <ratio-info
                            :value="item.cratio"
                            :content-loaded="true"
                            :display-circle="false"
                            :display-info-title="false"
                        />
                    </div>
                </div>
                <template v-else>
                    <ratio-info
                        :value="item.cratio"
                        :content-loaded="true"
                        :display-circle="false"
                        :display-info-title="false"
                    />
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
                                <router-link :to="{ path: `/defi/${item._fMintAccount.address}/fmint/lock` }">
                                    Lock
                                </router-link>
                                ,
                                <router-link :to="{ path: `/defi/${item._fMintAccount.address}/fmint/unlock` }">
                                    Unlock
                                </router-link>
                                ,
                                <router-link :to="{ path: `/defi/${item._fMintAccount.address}/fswap` }">
                                    Swap
                                </router-link>
                            </template>
                        </template>
                        <template v-if="item._debt > 0">
                            <template v-if="usedInFMint(item) && item.symbol === 'FUSD'">
                                <router-link :to="{ path: `/defi/${item._fMintAccount.address}/fmint/mint` }">
                                    Mint
                                </router-link>
                                ,
                                <router-link :to="{ path: `/defi/${item._fMintAccount.address}/fmint/repay` }">
                                    Repay
                                </router-link>
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
                            <router-link :to="{ path: `/defi/${item._fMintAccount.address}/fmint/lock` }">
                                Lock
                            </router-link>
                            <br />
                            <router-link :to="{ path: `/defi/${item._fMintAccount.address}/fmint/unlock` }">
                                Unlock
                            </router-link>
                            <br />
                            <router-link :to="{ path: `/defi/${item._fMintAccount.address}/fswap` }">
                                Swap
                            </router-link>
                        </template>
                    </template>
                    <template v-if="item._debt > 0">
                        <template v-if="usedInFMint(item) && item.symbol === 'FUSD'">
                            <router-link :to="{ path: `/defi/${item._fMintAccount.address}/fmint/mint` }">
                                Mint
                            </router-link>
                            <br />
                            <router-link :to="{ path: `/defi/${item._fMintAccount.address}/fmint/repay` }">
                                Repay
                            </router-link>
                        </template>
                    </template>
                    <template v-if="canClaimRewards(item.rewards)">
                        <br />
                        <router-link
                            v-if="canClaimRewards"
                            :to="{
                                path: `/defi/${item._fMintAccount.address}/fmint/claim-rewards/confirmation`,
                                query: { pendingRewards: pendingRewardsWFTM(item.rewards), token: { ...wftmToken } },
                                // name: 'defi-fmint-claim-rewards-confirmation',
                                // params: { pendingRewards: pendingRewardsWFTM(item.rewards), token: { ...wftmToken } },
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
import DepositOrBorrowTokenWindow from '@/components/windows/DepositOrBorrowTokenWindow/DepositOrBorrowTokenWindow.vue';
import { formatNumberByLocale } from '@/filters.js';
import { mapGetters } from 'vuex';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
import FEllipsis from '@/components/core/FEllipsis/FEllipsis.vue';
import RatioInfo from '@/components/RatioInfo/RatioInfo.vue';

export default {
    name: 'FMintOverviewList',

    components: { RatioInfo, FEllipsis, FTokenValue, DepositOrBorrowTokenWindow, FCryptoSymbol, FDataTable },

    props: {
        /** @type {DefiToken[]} */
        tokens: {
            type: Array,
            required: true,
            default() {
                return [];
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
            loading: true,
            stopLoading: false,
            columns: [
                {
                    name: 'accountName',
                    label: 'Wallet',
                    itemProp: 'accountName',
                    width: '150px',
                },
                {
                    name: 'asset',
                    label: 'Asset',
                    width: '140px',
                },
                {
                    name: 'amount',
                    label: 'Amount',
                    css: { textAlign: 'center' },
                },
                {
                    name: 'cratio',
                    label: 'C-Ratio',
                    css: { textAlign: 'center' },
                },
                {
                    name: 'rewards',
                    label: 'Est. Pending / Stashed Rewards',
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
        ...mapGetters(['currentAccount', 'accounts']),
    },

    created() {
        this.init();
    },

    beforeDestroy() {
        this.stopLoading = true;
    },

    methods: {
        async init() {
            const { accounts } = this;

            this.loading = true;

            if (accounts) {
                for (let i = 0; i < accounts.length; i++) {
                    await this.addRows(accounts[i]);

                    if (this.stopLoading) {
                        break;
                    }
                }
            }

            this.loading = false;
        },

        /**
         * @param {WalletAccount} _account
         * @return {Promise<>}
         */
        async addRows(_account) {
            const { $defi } = this;

            const result = await Promise.all([
                $defi.fetchFMintAccount(_account.address),
                $defi.fetchTokens(_account.address),
                $defi.init(),
            ]);

            const fMintAccount = result[0];
            const tokens = result[1].filter((_item) => _item.isActive && _item.canDeposit && _item.symbol !== 'FTM');

            this.wftmToken = tokens.find((_item) => _item.symbol === 'WFTM');

            const items = tokens.filter((_item) => {
                const collateral = this.getCollateral(_item, fMintAccount);
                const debt = this.getDebt(_item, fMintAccount);

                _item.accountName = _account.name;
                _item.accountAddress = _account.address;
                _item.cratio = this.collateralRatio(fMintAccount);

                // store collateral and debt for later use
                _item._collateral = collateral;
                _item._debt = debt;
                _item._fMintAccount = fMintAccount;

                return (collateral !== 0 || debt !== 0) && _item.symbol !== 'WFTM';
            });

            await this.setRewards(fMintAccount, items);

            if (this.items.length === 0) {
                this.items = items;
            } else {
                for (let i = 0, len1 = items.length; i < len1; i++) {
                    this.items.push(items[i]);
                }
            }

            this.$emit('records-count', this.items.length);
        },

        /**
         * @param {DefiToken} _token
         * @param {FMintAccount} _account
         * @return {*|number}
         */
        getDebt(_token, _account) {
            /** @type {FMintTokenBalance} */
            const tokenBalance = this.$defi.getFMintAccountDebt(_account, _token);

            return this.$defi.fromTokenValue(tokenBalance.balance, _token) || 0;
        },

        /**
         * @param {FMintAccount} _account
         * @param {array} _items
         */

        async setRewards(_account, _items) {
            for (let i = 0, len1 = _items.length; i < len1; i++) {
                if (_items[i].symbol === 'FUSD') {
                    _items[i].rewards = await this.$defi.fetchFMintAccountRewards(_account.address);
                    break;
                }
            }
        },

        /**
         * @param {DefiToken} _token
         * @param {FMintAccount} _account
         * @return {*|number}
         */
        formatDebt(_token, _account) {
            const debt = '_debt' in _token ? _token._debt : this.getDebt(_token, _account);

            return debt > 0 ? formatNumberByLocale(debt, this.defi.getTokenDecimals(_token)) : 0;
        },

        /**
         * @param {DefiToken} _token
         * @param {FMintAccount} _account
         * @return {*|number}
         */
        formatDebtFUSD(_token, _account) {
            const debt = this.getDebt(_token, _account);

            return debt > 0
                ? formatNumberByLocale(
                      debt * this.defi.getTokenPrice(_token),
                      this.defi.getTokenDecimals({ symbol: 'FUSD' })
                  )
                : 0;
        },

        /**
         * @param {DefiToken} _token
         * @param {FMintAccount} _account
         * @return {*|number}
         */
        getCollateral(_token, _account) {
            /** @type {FMintTokenBalance} */
            const tokenBalance = this.$defi.getFMintAccountCollateral(_account, _token);

            return this.$defi.fromTokenValue(tokenBalance.balance, _token) || 0;
        },

        /**
         * @param {DefiToken} _token
         * @param {FMintAccount} _account
         * @return {*|number}
         */
        formatCollateral(_token, _account) {
            const collateral = '_collateral' in _token ? _token._collateral : this.getCollateral(_token, _account);

            return collateral > 0 ? formatNumberByLocale(collateral, this.defi.getTokenDecimals(_token)) : 0;
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
         * @param {FMintAccount} _fMintAccount
         */
        collateralRatio(_fMintAccount) {
            return this.$defi.getCollateralRatio(_fMintAccount);
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
