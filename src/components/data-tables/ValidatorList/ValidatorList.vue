<template>
    <div class="validator-list-dt" @click="onClick">
        <template v-if="!dValidatorListError">
            <f-data-table
                :columns="dColumns"
                :items="dItems"
                :mobile-view="cMobileView"
                :loading="cLoading"
                first-m-v-column-width="6"
                fixed-header
                f-card-off
                class="f-data-table-body-bg-color"
            >
                <template v-slot:column-logo="{ value, item, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col-6 f-row-label">{{ column.label }}</div>
                        <div class="col break-word">
                            <div class="inline-img validator-img">
                                <img v-if="value" :src="value" :alt="item.stakerInfo.name" class="not-fluid" />
                                <img v-else src="img/fantom-logo.png" alt="fantom logo" class="not-fluid" />
                            </div>
                        </div>
                    </div>
                    <template v-else>
                        <div class="inline-img validator-img">
                            <img v-if="value" :src="value" :alt="item.stakerInfo.name" class="not-fluid" />
                            <img v-else src="img/fantom-logo.png" alt="fantom logo" class="not-fluid" />
                        </div>
                    </template>
                </template>

                <template v-slot:column-name="{ value, item, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col-6 f-row-label">{{ column.label }}</div>
                        <div class="col break-word">
                            <a
                                :href="`${explorerUrl}validator/${item.stakerAddress}`"
                                target="_blank"
                                class="break-word"
                            >
                                {{ value }}
                            </a>
                            <a
                                v-if="item.stakerInfo ? item.stakerInfo.website || item.stakerInfo.contact : ''"
                                :href="item.stakerInfo ? item.stakerInfo.website || item.stakerInfo.contact : ''"
                                target="_blank"
                                rel="nofollow"
                                class="validator-website"
                            >
                                <icon data="@/assets/svg/external-link-alt.svg"></icon>
                            </a>
                        </div>
                    </div>
                    <template v-else>
                        <a :href="`${explorerUrl}validator/${item.stakerAddress}`" target="_blank" class="break-word">
                            {{ value }}
                        </a>
                        <a
                            v-if="item.stakerInfo ? item.stakerInfo.website || item.stakerInfo.contact : ''"
                            :href="item.stakerInfo ? item.stakerInfo.website || item.stakerInfo.contact : ''"
                            target="_blank"
                            rel="nofollow"
                            class="validator-website"
                        >
                            <icon data="@/assets/svg/external-link-alt.svg"></icon>
                        </a>
                    </template>
                </template>

                <template v-slot:column-select="{ value, item, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col break-word align-center select-validator-mv">
                            <button
                                :disabled="item.isOffline || item.isCheater"
                                class="btn select-btn"
                                :data-validator-id="value"
                            >
                                Select
                            </button>
                        </div>
                    </div>
                    <template v-else>
                        <button
                            :disabled="item.isOffline || item.isCheater || item.alreadyDelegated"
                            class="btn select-btn"
                            :data-validator-id="value"
                        >
                            Select
                        </button>
                    </template>
                </template>

                <!--
                <template v-slot:column-stakerAddress="{ value, item, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col-6 f-row-label">{{ column.label }}</div>
                        <div class="col break-word">
                            <div v-if="item.isOffline" class="offline">{{ $t('view_validator_list.offline') }}</div>
                            <router-link
                                :to="{ name: 'validator-detail', params: { address: value } }"
                                :title="value"
                                >{{ value | formatHash }}</router-link
                            >
                        </div>
                    </div>
                    <template v-else>
                        <div v-if="item.isOffline" class="offline">{{ $t('view_validator_list.offline') }}</div>
                        <router-link :to="{ name: 'validator-detail', params: { address: value } }" :title="value">{{
                            value | formatHash
                        }}</router-link>
                    </template>
                </template>
                -->
            </f-data-table>
        </template>

        <template v-else>
            <div class="query-error">{{ dValidatorListError }}</div>
        </template>
    </div>
</template>

<script>
import FDataTable from '../../core/FDataTable/FDataTable.vue';
import gql from 'graphql-tag';
import { WEIToFTM } from '../../../utils/transactions.js';
import { formatHexToInt, timestampToDate, numToFixed, formatNumberByLocale } from '../../../filters.js';
import { sortByHex, sortByLocaleString } from '../../../utils/array-sorting.js';
import appConfig from '../../../../app.config.js';
import { cloneObject } from '@/utils';
import { mapGetters } from 'vuex';

export default {
    name: 'ValidatorList',

    components: {
        FDataTable,
    },

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
        /** Component is used in FWindow. */
        windowMode: {
            type: Boolean,
            default: false,
        },
    },

    apollo: {
        stakers: {
            query: gql`
                query Stakers {
                    stakers {
                        id
                        stakerAddress
                        isOffline
                        isCheater
                        createdTime
                        stake
                        totalStake
                        delegatedMe
                        poi
                        isOffline
                        isCheater
                        stakerInfo {
                            name
                            website
                            contact
                            logoUrl
                        }
                    }
                }
            `,
            async result(_data, _key) {
                const totals = {
                    selfStaked: 0,
                    totalDelegated: 0,
                    totalStaked: 0,
                };
                let data;
                const flagged = [];
                const tUnknown = this.$t('view_validator_list.unknown');

                if (_key === 'stakers') {
                    data = cloneObject(_data.data.stakers);

                    data.forEach((_item, _idx) => {
                        // _item.total_staked = WEIToFTM(_item.stake) + WEIToFTM(_item.delegatedMe);
                        totals.selfStaked += parseFloat(numToFixed(WEIToFTM(_item.stake), 0));
                        totals.totalDelegated += parseFloat(numToFixed(WEIToFTM(_item.delegatedMe), 0));
                        totals.totalStaked += parseFloat(numToFixed(WEIToFTM(_item.totalStake), 0));

                        if (!_item.stakerInfo) {
                            _item.stakerInfo = {};
                        }

                        if (!_item.stakerInfo.name) {
                            _item.stakerInfo.name = tUnknown;
                        }

                        if (_item.isCheater) {
                            flagged.push(_idx);
                        }

                        _item.alreadyDelegated = true;
                    });

                    if (flagged.length > 0) {
                        for (let i = flagged.length - 1; i >= 0; i--) {
                            flagged[i] = data.splice(flagged[i], 1)[0];
                        }

                        this.$emit('validator-list-flagged', flagged);
                    }

                    this.dItems = data;

                    this.$emit('records-count', this.dItems.length);
                    this.$emit('validator-list-totals', totals);

                    const stakerIds = await this.fetchStakerIds();

                    if (stakerIds.length > 0) {
                        data.forEach((_item) => {
                            if (stakerIds.indexOf(_item.id) === -1) {
                                _item.alreadyDelegated = false;
                            }
                        });
                    } else {
                        data.forEach((_item) => {
                            _item.alreadyDelegated = false;
                        });
                    }
                }
            },
            skip() {
                return this.items.length > 0;
            },
            error(_error) {
                this.dValidatorListError = _error.message;
            },
        },
    },

    data() {
        return {
            explorerUrl: appConfig.explorerUrl,
            dItems: [],
            dValidatorListError: '',
            dColumns: [
                {
                    name: 'logo',
                    label: this.$t('view_validator_list.logo'),
                    itemProp: 'stakerInfo.logoUrl',
                    css: { textAlign: 'center' },
                    width: '80px',
                },
                {
                    name: 'name',
                    label: this.$t('view_validator_list.name'),
                    itemProp: 'stakerInfo.name',
                    sortFunc: sortByLocaleString,
                    width: '200px',
                },
                {
                    name: 'id',
                    label: this.$t('view_validator_list.id'),
                    formatter: formatHexToInt,
                    sortFunc: sortByHex,
                    width: '80px',
                },
                /*
                {
                    name: 'stakerAddress',
                    label: this.$t('view_validator_list.address'),
                    sortFunc: sortByString,
                    width: '200px',
                },
                */
                {
                    name: 'stake',
                    label: this.$t('view_validator_list.self_staked'),
                    formatter: (_value) => formatNumberByLocale(WEIToFTM(_value), 0),
                    sortFunc: sortByHex,
                    css: { textAlign: 'right' },
                },
                {
                    name: 'delegatedMe',
                    label: this.$t('view_validator_list.delegated'),
                    formatter: (_value) => formatNumberByLocale(WEIToFTM(_value), 0),
                    sortFunc: sortByHex,
                    css: { textAlign: 'right' },
                },
                // computed
                {
                    name: 'totalStake',
                    label: this.$t('view_validator_list.total_staked'),
                    formatter: (_value) => formatNumberByLocale(WEIToFTM(_value), 0),
                    sortFunc: sortByHex,
                    sortDir: 'desc',
                    css: { textAlign: 'right' },
                },
                {
                    name: 'select',
                    // label: this.$t('view_validator_list.logo'),
                    itemProp: 'id',
                    css: { textAlign: 'center' },
                    width: '140px',
                },
            ],
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        /**
         * Property is set to `true`, if 'tvalidator-list-dt-mobile-view' breakpoint is reached.
         *
         * @return {Boolean}
         */
        cMobileView() {
            const dataTableBreakpoint = this.$store.state.breakpoints['validator-list-dt-mobile-view'];

            return dataTableBreakpoint && dataTableBreakpoint.matches;
        },

        cLoading() {
            return this.loading || this.$apollo.queries.stakers.loading;
        },
    },

    created() {
        if (this.items.length > 0) {
            this.dItems = this.items;
        }
    },

    methods: {
        /**
         * @return {Promise<[]>}
         */
        async fetchStakerIds() {
            const delegations = await this.$fWallet.fetchAll(
                {
                    query: gql`
                        query DelegationsByAddress($address: Address!, $cursor: Cursor, $count: Int!) {
                            delegationsByAddress(address: $address, cursor: $cursor, count: $count) {
                                pageInfo {
                                    first
                                    last
                                    hasNext
                                    hasPrevious
                                }
                                totalCount
                                edges {
                                    cursor
                                    delegation {
                                        toStakerId
                                    }
                                }
                            }
                        }
                    `,
                    variables: {
                        address: this.currentAccount.address,
                        count: 100,
                        cursor: null,
                    },
                    fetchPolicy: 'network-only',
                },
                'delegationsByAddress'
            );

            return delegations.map((_item) => (_item.delegation ? _item.delegation.toStakerId : ''));
        },

        onClick(_event) {
            const eSelectBtn = _event.target.closest('.select-btn');

            if (eSelectBtn) {
                const id = eSelectBtn.getAttribute('data-validator-id');
                const validator = id ? this.dItems.find((_item) => _item.id === id) : null;

                if (validator) {
                    this.$emit('validator-selected', {
                        id: validator.id,
                        address: validator.stakerAddress,
                        name: validator.stakerInfo.name,
                    });
                }
            }
        },

        WEIToFTM,
        timestampToDate,
        numToFixed,
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
