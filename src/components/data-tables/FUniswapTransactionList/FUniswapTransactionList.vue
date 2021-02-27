<template>
    <div class="funiswaptransactionlist">
        <div v-if="error" class="query-error">{{ error }}</div>

        <f-tabs @tab-set="activeTabId = $event.tabId">
            <f-tab id="funiswaptransactionlist-all" title="All"></f-tab>
            <f-tab id="funiswaptransactionlist-swaps" title="Swaps"></f-tab>
            <f-tab id="funiswaptransactionlist-adds" title="Adds"></f-tab>
            <f-tab id="funiswaptransactionlist-removes" title="Removes"></f-tab>
        </f-tabs>

        <f-data-table
            :columns="columns"
            :items="items"
            :loading="loading"
            :disable-infinite-scroll="!pageInfo.hasNext"
            first-m-v-column-width="6"
            infinite-scroll
            f-card-off
            no-f-l-padding
            class="f-data-table-body-bg-color"
            @fetch-more="fetchMore"
        >
            <template v-slot:column-action="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word">
                        <a :href="`${explorerUrl}${explorerTransactionPath}/${value.transactionHash}`" target="_blank">
                            {{ formatActionText(value) }}
                        </a>
                    </div>
                </div>
                <template v-else>
                    <a :href="`${explorerUrl}${explorerTransactionPath}/${value.transactionHash}`" target="_blank">
                        {{ formatActionText(value) }}
                    </a>
                </template>
            </template>

            <template v-slot:column-time="{ value, item, column }">
                <div v-if="column" class="row no-collapse no-vert-col-padding">
                    <div class="col-6 f-row-label">{{ column.label }}</div>
                    <div class="col break-word"></div>
                </div>
                <template v-else>
                    <timeago :datetime="value"></timeago>
                </template>
            </template>
        </f-data-table>
    </div>
</template>

<script>
import FDataTable from '@/components/core/FDataTable/FDataTable.vue';
import { mapGetters } from 'vuex';
import { eventBusMixin } from '@/mixins/event-bus.js';
import gql from 'graphql-tag';
import { formatHexToInt, timestampToDate } from '@/filters.js';
import { cloneObject } from '@/utils';
import FTabs from '@/components/core/FTabs/FTabs.vue';
import FTab from '@/components/core/FTabs/FTab.vue';
import appConfig from '../../../../app.config.js';

export default {
    name: 'FUniswapTransactionList',

    components: { FTab, FTabs, FDataTable },

    mixins: [eventBusMixin],

    props: {
        /** @type {UniswapPair} */
        pair: {
            type: Object,
            default() {
                return {};
            },
            required: true,
        },
    },

    data() {
        return {
            items: [],
            columns: [
                {
                    name: 'action',
                    label: 'Action',
                    width: '230px',
                    itemProp: 'uniswapAction',
                    /*formatter: (_value) => {
                        return _value.transactionHash;
                    },*/
                },
                /*{
                    name: 'totalvalue',
                    label: 'Total Value',
                    formatter: () => {
                        return '-';
                    },
                    css: { textAlign: 'right' },
                },*/
                {
                    name: 'token1amount',
                    label: 'Token amount',
                    itemProp: 'uniswapAction',
                    formatter: (_value) => {
                        return this.formatTokenAmount(_value);
                    },
                    css: { textAlign: 'right' },
                },
                {
                    name: 'token2amount',
                    label: 'Token amount',
                    itemProp: 'uniswapAction',
                    formatter: (_value) => {
                        return this.formatTokenAmount(_value, 2);
                    },
                    css: { textAlign: 'right' },
                },
                {
                    name: 'time',
                    label: 'Time',
                    width: '180px',
                    itemProp: 'uniswapAction.time',
                    formatter: (_value) => {
                        return timestampToDate(_value);
                        // return formatDate(timestampToDate(_value), true, true, { month: 'numeric' });
                    },
                    css: { textAlign: 'right' },
                },
            ],
            /** -1 - all, 0 - swap, 1 - mint, 2 - burn */
            actionType: -1,
            error: '',
            activeTabId: '',
            pageInfo: {},
            totalCount: 0,
            loading: false,
            explorerUrl: appConfig.explorerUrl,
            explorerTransactionPath: appConfig.explorerTransactionPath,
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        token1() {
            return this.$defi.getPairToken(this.pair);
        },

        token2() {
            return this.$defi.getPairToken(this.pair, 1);
        },

        token1Symbol() {
            return this.$defi.getPairTokenSymbol(this.pair);
        },

        token2Symbol() {
            return this.$defi.getPairTokenSymbol(this.pair, 1);
        },
    },

    watch: {
        pair() {
            this.loadData(this.actionType);
        },

        activeTabId(_tabId) {
            if (_tabId === 'funiswaptransactionlist-all') {
                this.actionType = -1;
            } else if (_tabId === 'funiswaptransactionlist-swaps') {
                this.actionType = 0;
            } else if (_tabId === 'funiswaptransactionlist-adds') {
                this.actionType = 1;
            } else if (_tabId === 'funiswaptransactionlist-removes') {
                this.actionType = 2;
            }

            this.loadData(this.actionType);
        },
    },

    created() {
        this.init();
        // this._eventBus.on('account-picked', this.onAccountPicked);
    },

    methods: {
        /**
         * @param {UniswapAction} _action
         */
        formatActionText(_action) {
            const { type } = _action;
            let { token1Symbol } = this;
            let { token2Symbol } = this;
            let action = 'Swap';
            let cl = 'and';

            if (this.swapTokens(_action)) {
                const h = token1Symbol;
                token1Symbol = token2Symbol;
                token2Symbol = h;
            }

            if (type === 0) {
                cl = 'for';
            } else if (type === 1) {
                action = 'Add';
            } else if (type === 2) {
                action = 'Remove';
            }

            return `${action} ${token1Symbol} ${cl} ${token2Symbol}`;
        },

        /**
         * @param {UniswapAction} _action
         * @param {number} [_tokenNum]
         */
        formatTokenAmount(_action, _tokenNum = 1) {
            const { type } = _action;
            let symbol = '';
            let amountIn = '';
            let amountOut = '';
            let amount;
            let tokenNum = _tokenNum;

            if (this.swapTokens(_action)) {
                tokenNum = _tokenNum === 1 ? 2 : 1;
            }

            if (tokenNum === 1) {
                amountIn = _action.amount0in;
                amountOut = _action.amount0out;
            } else {
                amountIn = _action.amount1in;
                amountOut = _action.amount1out;
            }

            if (tokenNum === 1) {
                symbol = this.token1Symbol;
            } else {
                symbol = this.token2Symbol;
            }

            if (type === 0) {
                if (_tokenNum === 1) {
                    amount = amountOut;
                } else {
                    amount = amountIn;
                }
            } else if (type === 1) {
                amount = amountIn;
            } else if (type === 2) {
                amount = amountOut;
            }

            return `${this.getTokenAmount(amount, tokenNum)} ${symbol}`;
        },

        getTokenAmount(_amount, _tokenNum) {
            const token = _tokenNum === 1 ? this.token1 : this.token2;

            return this.$defi.fromTokenValue(_amount, token).toFixed(2);
        },

        /**
         * @param {UniswapAction} _action
         * @return {boolean}
         */
        swapTokens(_action) {
            return _action && _action.type === 0 && _action.amount0in !== '0x0' && _action.amount1out !== '0x0';
        },

        async init() {
            // this.loadData(this.actionType);
        },

        async loadData(_actionType, _cursor) {
            const { pair } = this;

            if (this.pairExists()) {
                this.loading = true;

                try {
                    // console.log('loadData', _actionType, this.pairExists());

                    const data = cloneObject(await this.fetchFUniswapActions(pair.pairAddress, _actionType, _cursor));
                    const edges = data.edges;

                    if (edges && edges.length > 0 && edges[0].id && this.items.length > 0) {
                        this.loading = false;
                        return;
                    }

                    this.pageInfo = cloneObject(data.pageInfo);

                    // console.log(JSON.stringify(edges));

                    if (this.items.length === 0 || !_cursor) {
                        this.items = edges;
                    } else {
                        for (let i = 0, len1 = edges.length; i < len1; i++) {
                            this.items.push(edges[i]);
                        }
                    }

                    this.totalCount = formatHexToInt(data.totalCount);
                    this.$emit('records-count', this.totalCount);

                    // this.loading = false;
                } catch (_error) {
                    this.loading = false;
                    this.error = _error;
                }
            }
        },

        /**
         * @param {string} _pairAddress
         * @param {number} _actionType
         * @param {string} _cursor
         * @param {number} [_count]
         * @return {Promise<Object>}
         */
        async fetchFUniswapActions(_pairAddress, _actionType, _cursor, _count = 15) {
            const data = await this.$apollo.query({
                query: gql`
                    query GetFUniswapActions($pairAddress: Address, $cursor: Cursor, $count: Int!, $actionType: Int) {
                        defiUniswapActions(
                            pairAddress: $pairAddress
                            cursor: $cursor
                            count: $count
                            actionType: $actionType
                        ) {
                            totalCount
                            pageInfo {
                                first
                                last
                                hasNext
                                hasPrevious
                            }
                            edges {
                                uniswapAction {
                                    id
                                    uniswapPair {
                                        tokens {
                                            symbol
                                            decimals
                                        }
                                    }
                                    pairAddress
                                    transactionHash
                                    sender
                                    type
                                    blockNr
                                    time
                                    amount0in
                                    amount0out
                                    amount1in
                                    amount1out
                                }
                                cursor
                            }
                        }
                    }
                `,
                variables: {
                    pairAddress: _pairAddress,
                    actionType: _actionType === -1 ? undefined : _actionType,
                    cursor: _cursor,
                    count: _count,
                },
                fetchPolicy: 'network-only',
            });

            return data.data.defiUniswapActions || {};
        },

        pairExists() {
            const { pair } = this;

            return pair && !!pair.pairAddress;
        },

        fetchMore() {
            if (this.pageInfo.hasNext) {
                this.loadData(this.actionType, this.pageInfo.last);
            }
        },

        onAccountPicked() {
            this.init();
        },
    },
};
</script>
