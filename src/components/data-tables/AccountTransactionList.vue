<template>
    <f-card class="account-transaction-list-dt" :off="windowMode">
        <!--
        <h2 v-if="!windowMode" class="dt-heading">
            Transactions <span class="f-records-count">({{ totalCount | formatHexToInt }})</span>
        </h2>
        -->

        <template v-if="!dAccountByAddressError">
            <f-data-table
                :columns="dColumns"
                :items="dItems"
                :disable-infinite-scroll="!dHasNext"
                :mobile-view="cMobileView"
                :loading="cLoading"
                first-m-v-column-width="5"
                infinite-scroll
                fixed-header
                f-card-off
                class="f-data-table-body-bg-color"
                @fetch-more="fetchMore"
            >
                <template v-slot:column-status="{ value, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col-5 f-row-label">{{ column.label }}</div>
                        <div class="col-7">
                            <f-transaction-status :status="value" class="light" />
                        </div>
                    </div>
                    <template v-else>
                        <f-transaction-status :status="value" class="light" />
                    </template>
                </template>

                <template v-slot:column-timestamp="{ value, item, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col-5 f-row-label">{{ column.label }}</div>
                        <div class="col-7">
                            <a
                                :href="`${explorerUrl}transactions/${item.transaction.hash}`"
                                target="_blank"
                                class="break-word"
                            >
                                {{ value }}
                            </a>
                        </div>
                    </div>
                    <template v-else>
                        <a
                            :href="`${explorerUrl}transactions/${item.transaction.hash}`"
                            target="_blank"
                            class="break-word"
                        >
                            {{ value }}
                        </a>
                    </template>
                </template>

                <template v-slot:column-address="{ value, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col-5 f-row-label">{{ column.label }}</div>
                        <div class="col-7">
                            <a :href="`${explorerUrl}address/${value}`" target="_blank">
                                <f-ellipsis :text="value" overflow="middle" />
                            </a>
                        </div>
                    </div>
                    <template v-else>
                        <a :href="`${explorerUrl}address/${value}`" target="_blank">
                            <f-ellipsis :text="value" overflow="middle" />
                        </a>
                    </template>
                </template>

                <template v-slot:column-amount="{ value, item, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col-5 f-row-label">{{ column.label }}</div>
                        <div class="col-7">
                            <template v-if="address">
                                <f-account-transaction-amount
                                    :address="address"
                                    :from="getFrom(item)"
                                    :to="getTo(item)"
                                    :amount="value"
                                />
                            </template>
                            <template v-else>
                                {{ value }}
                            </template>
                        </div>
                    </div>
                    <template v-else>
                        <template v-if="address">
                            <f-account-transaction-amount
                                :address="address"
                                :from="getFrom(item)"
                                :to="getTo(item)"
                                :amount="value"
                            />
                        </template>
                        <template v-else>
                            {{ value }}
                        </template>
                    </template>
                </template>
            </f-data-table>
        </template>

        <template v-else>
            <div class="query-error">{{ dAccountByAddressError }}</div>
        </template>
    </f-card>
</template>

<script>
import FDataTable from '../core/FDataTable/FDataTable.vue';
import gql from 'graphql-tag';
import { WEIToFTM } from '../../utils/transactions.js';
import { timestampToDate, formatNumberByLocale, formatHexToInt, formatDate } from '../../filters.js';
import FAccountTransactionAmount from '../core/FAccountTransactionAmount/FAccountTransactionAmount.vue';
import { cloneObject, getNestedProp } from '../../utils';
import FCard from '../core/FCard/FCard.vue';
import appConfig from '../../../app.config.js';
import FEllipsis from '../core/FEllipsis/FEllipsis.vue';
import FTransactionStatus from '../core/FTransactionStatus/FTransactionStatus.vue';

export default {
    components: {
        FTransactionStatus,
        FEllipsis,
        FCard,
        FAccountTransactionAmount,
        FDataTable,
    },

    props: {
        /** Use address column instead of columns `from` and `to`. */
        address: {
            type: String,
            default: '',
            required: true,
        },
        /** Number of items per page. */
        itemsPerPage: {
            type: Number,
            default: 40,
        },
        /** Component is used in FWindow. */
        windowMode: {
            type: Boolean,
            default: false,
        },
    },

    apollo: {
        account: {
            query: gql`
                query AccountByAddress($address: Address!, $cursor: Cursor, $count: Int!) {
                    account(address: $address) {
                        address
                        balance
                        txCount
                        txList(cursor: $cursor, count: $count) {
                            pageInfo {
                                first
                                last
                                hasNext
                                hasPrevious
                            }
                            totalCount
                            edges {
                                cursor
                                transaction {
                                    hash
                                    from
                                    to
                                    value
                                    gasUsed
                                    status
                                    block {
                                        number
                                        timestamp
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            variables() {
                return {
                    address: this.address,
                    count: this.itemsPerPage,
                    cursor: null,
                };
            },
            result(_data, _key) {
                let data;

                if (_key === 'account') {
                    data = cloneObject(_data.data.account);

                    const edges = data.txList.edges;

                    if (edges && edges.length > 0 && edges[0].id && this.dItems.length > 0) {
                        return;
                    }

                    this.dHasNext = data.txList.pageInfo.hasNext;

                    if (this.dItems.length === 0) {
                        this.dItems = edges;
                    } else {
                        for (let i = 0, len1 = edges.length; i < len1; i++) {
                            this.dItems.push(edges[i]);
                        }
                    }

                    this.totalCount = data.txList.totalCount;
                    this.$emit('records-count', formatHexToInt(this.totalCount));
                }
            },
            error(_error) {
                this.dAccountByAddressError = _error.message;
            },
        },
    },

    data() {
        return {
            totalCount: 0,
            explorerUrl: appConfig.explorerUrl,
            dItems: [],
            dHasNext: false,
            dAccountByAddressError: '',
            dColumns: [
                {
                    name: 'status',
                    label: 'Status',
                    itemProp: 'transaction.status',
                    formatter: (_value) => formatHexToInt(_value),
                    width: '140px',
                },
                {
                    name: 'timestamp',
                    label: 'Time',
                    // itemProp: `${!this.withoutCursor ? 'transaction.' : ''}block.timestamp`,
                    itemProp: 'transaction.block.timestamp',
                    formatter: (_value) => formatDate(timestampToDate(_value), true, true),
                    width: '320px',
                },
                {
                    name: 'address',
                    label: 'Address',
                    // width: '460px',
                    itemProp: 'transaction.from',
                    formatter: (_value, _item) => {
                        // const from = getNestedProp(_item, `${!this.withoutCursor ? 'transaction.' : ''}from`);
                        // const to = getNestedProp(_item, `${!this.withoutCursor ? 'transaction.' : ''}to`);
                        const from = this.getFrom(_item);
                        const to = this.getTo(_item);

                        if (this.address.toLowerCase() !== from.toLowerCase()) {
                            return from;
                        } else {
                            return to;
                        }
                    },
                    oneLineMode: true,
                    // width: '180px'
                },
                {
                    name: 'amount',
                    label: 'Amount (FTM)',
                    itemProp: 'transaction.value',
                    formatter: (_value) => {
                        return formatNumberByLocale(WEIToFTM(_value));
                    },
                    width: '150px',
                    css: {
                        textAlign: 'right',
                    },
                },
            ],
        };
    },

    computed: {
        /**
         * Property is set to `true`, if 'account-transaction-list-dt-mobile-view' breakpoint is reached.
         *
         * @return {Boolean}
         */
        cMobileView() {
            const dataTableBreakpoint = this.$store.state.breakpoints['account-transaction-list-dt-mobile-view'];

            return dataTableBreakpoint && dataTableBreakpoint.matches;
        },

        cLoading() {
            return this.$apollo.queries.account.loading;
        },
    },

    methods: {
        /**
         * Get item's 'from' value.
         *
         * @param {Object} _item
         * @return {*}
         */
        getFrom(_item) {
            return getNestedProp(_item, `${!this.withoutCursor ? 'transaction.' : ''}from`);
        },

        /**
         * Get item's 'to' value.
         *
         * @param {Object} _item
         * @return {*}
         */
        getTo(_item) {
            return getNestedProp(_item, `${!this.withoutCursor ? 'transaction.' : ''}to`);
        },

        fetchMore() {
            const { account } = this;

            if (account && account.txList.pageInfo && account.txList.pageInfo.hasNext) {
                const cursor = account.txList.pageInfo.last;

                this.$apollo.queries.account.fetchMore({
                    variables: {
                        cursor,
                        count: this.itemsPerPage,
                    },
                    updateQuery: (previousResult, { fetchMoreResult }) => {
                        // this.dHasNext = fetchMoreResult.account.pageInfo.hasNext;
                        return fetchMoreResult;
                    },
                });
            }
        },

        WEIToFTM,
        timestampToDate,
    },
};
</script>
