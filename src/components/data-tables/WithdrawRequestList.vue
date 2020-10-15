<template>
    <div class="withdraw-request-list-dt" @click="onClick">
        <template v-if="!withdrawRequestListError">
            <f-data-table
                :columns="columns"
                :items="dItems"
                first-m-v-column-width="6"
                fixed-header
                f-card-off
                no-f-l-padding
                class="f-data-table-body-bg-color"
            >
                <template v-slot:column-withdrawal="{ value, item, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col-6 f-row-label">{{ column.label }}</div>
                        <div class="col break-word">
                            <template v-if="value">{{ formatDate(timestampToDate(value), false, true) }}</template>
                            <template v-else>
                                <button
                                    :disabled="!!canNotWithdraw(item.requestBlock.timestamp) || !canWithdraw(item)"
                                    class="btn withdraw-btn"
                                    :data-item-id="item.id"
                                >
                                    {{ withdrawBtnLabel(item.requestBlock.timestamp) }}
                                </button>
                            </template>
                        </div>
                    </div>
                    <template v-else>
                        <template v-if="value">{{ formatDate(timestampToDate(value), false, true) }}</template>
                        <template v-else>
                            <button
                                :disabled="!!canNotWithdraw(item.requestBlock.timestamp) || !canWithdraw(item)"
                                class="btn withdraw-btn"
                                :data-item-id="item.id"
                            >
                                {{ withdrawBtnLabel(item.requestBlock.timestamp) }}
                            </button>
                        </template>
                    </template>
                </template>
            </f-data-table>
        </template>
        <template v-else>
            <div class="query-error">{{ withdrawRequestListError }}</div>
        </template>
    </div>
</template>

<script>
import { formatDate, formatNumberByLocale, prepareTimestamp, timestampToDate } from '../../filters.js';
import { WEIToFTM } from '../../utils/transactions.js';
import FDataTable from '../core/FDataTable/FDataTable.vue';
import dayjs from 'dayjs';
import { sortByHex } from '../../utils/array-sorting.js';

export default {
    name: 'WithdrawRequestList',

    components: { FDataTable },

    props: {
        /**
         * Data and action.
         * Actions:
         * '' - replace items
         * 'append' - append new items
         */
        items: {
            type: Array,
            default() {
                return [];
            },
        },
    },

    data() {
        return {
            dItems: [],
            withdrawRequestListError: '',
            columns: [
                {
                    name: 'amount',
                    label: 'Amount (FTM)',
                    formatter: (_value) => {
                        return formatNumberByLocale(WEIToFTM(_value));
                    },
                    width: '234px',
                },
                {
                    name: 'undelegation_time',
                    label: 'Undelegation Time',
                    itemProp: 'requestBlock.timestamp',
                    formatter: (_value) => {
                        return formatDate(timestampToDate(_value), false, true);
                    },
                },
                {
                    name: 'withdrawal',
                    label: 'Withdrawal',
                    itemProp: 'withdrawBlock.timestamp',
                },
            ],
        };
    },

    computed: {
        pendingPartialUndelegations() {
            let count = 0;

            this.dItems.forEach((_item) => {
                if (!_item.withdrawBlock) {
                    count++;
                }
            });

            return count > 1;
        },
    },

    watch: {
        items: {
            handler(_value) {
                this.dItems = _value.sort(sortByHex('requestBlock.timestamp', 'desc'));
            },
            deep: true,
            immediate: true,
        },
    },

    methods: {
        /**
         * Get label for withdraw button.
         *
         * @param {string} _timestamp
         * @return {string}
         */
        withdrawBtnLabel(_timestamp) {
            return this.canNotWithdraw(_timestamp) || 'Withdraw';
        },

        /**
         * Check if amount is available to withdraw.
         *
         * @param {string} _timestamp
         * @return {string}
         */
        canNotWithdraw(_timestamp) {
            const end = dayjs(this.prepareTimestamp(_timestamp)).add(7, 'days');
            const now = dayjs();

            if (now.diff(end) < 0) {
                return end.from(now);
            } else {
                return '';
            }
        },

        /**
         * Check if amount is available to withdraw.
         *
         * @param {object} _withdrawRequest
         * @return {boolean}
         */
        canWithdraw(_withdrawRequest) {
            return (!this.pendingPartialUndelegations || !_withdrawRequest.final) && !_withdrawRequest.withdrawBlock;
        },

        onClick(_event) {
            const eWithdrawBtn = _event.target.closest('.withdraw-btn');

            if (eWithdrawBtn) {
                const id = eWithdrawBtn.getAttribute('data-item-id');
                const withdrawRequest = this.dItems.find((_item) => _item.id === id);

                if (withdrawRequest && this.canWithdraw(withdrawRequest)) {
                    this.$emit('withdraw-request-selected', withdrawRequest);
                }
            }
        },

        formatDate,
        timestampToDate,
        prepareTimestamp,
    },
};
</script>
