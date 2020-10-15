<template>
    <div class="ballot-list">
        <f-card class="account-transaction-list-dt" :off="windowMode">
            <h2 v-if="!windowMode" class="dt-heading">
                Polls <span class="f-records-count">({{ totalCount }})</span>
            </h2>

            <template v-if="!ballotsError">
                <f-data-table
                    :columns="columns"
                    :items="dItems"
                    :disable-infinite-scroll="!hasNext"
                    :mobile-view="cMobileView"
                    :loading="cLoading"
                    infinite-scroll
                    fixed-header
                    f-card-off
                    class="f-data-table-body-bg-color"
                    @fetch-more="fetchMore"
                    @click.native="onDataTableClick"
                >
                    <template v-slot:column-name="{ value, item, column }">
                        <div v-if="column" class="row no-collapse no-vert-col-padding">
                            <div class="col-4 f-row-label">{{ column.label }}</div>
                            <div class="col-8">
                                <template v-if="item.ballot.detailsUrl">
                                    <a :href="item.ballot.detailsUrl" target="_blank">{{ value }}</a>
                                </template>
                                <template v-else>
                                    {{ value }}
                                </template>
                            </div>
                        </div>
                        <template v-else>
                            <template v-if="item.ballot.detailsUrl">
                                <a :href="item.ballot.detailsUrl" target="_blank">{{ value }}</a>
                            </template>
                            <template v-else>
                                {{ value }}
                            </template>
                        </template>
                    </template>

                    <template v-slot:column-startend="{ value, item, column }">
                        <div v-if="column" class="row no-collapse no-vert-col-padding">
                            <div class="col-4 f-row-label">{{ column.label }}</div>
                            <div class="col-8">
                                {{ value }} <br />
                                {{ formatDate(timestampToDate(item.ballot.end), true, true) }}
                            </div>
                        </div>
                        <template v-else>
                            {{ value }} <br />
                            {{ formatDate(timestampToDate(item.ballot.end), true, true) }}
                        </template>
                    </template>

                    <template v-slot:column-vote="{ value, item, column }">
                        <div v-if="column" class="row no-collapse no-vert-col-padding">
                            <div class="col-4 f-row-label">{{ column.label }}</div>
                            <div class="col-8">
                                <template v-if="item.ballot._proposal">{{ item.ballot._proposal }}</template>
                                <template v-else-if="item.ballot.isOpen">
                                    <button
                                        type="button"
                                        class="btn vote-btn"
                                        :data-ballot-address="item.ballot.address"
                                    >
                                        Vote
                                    </button>
                                </template>
                                <template v-else>-</template>
                            </div>
                        </div>
                        <template v-else>
                            <template v-if="item.ballot._proposal">{{ item.ballot._proposal }}</template>
                            <template v-else-if="item.ballot.isOpen">
                                <button class="btn vote-btn" :data-ballot-address="item.ballot.address">Vote</button>
                            </template>
                            <template v-else>-</template>
                        </template>
                    </template>
                </f-data-table>
            </template>

            <template v-else>
                <div class="query-error">{{ ballotsError }}</div>
            </template>
        </f-card>
    </div>
</template>

<script>
import FCard from '../../core/FCard/FCard.vue';
import gql from 'graphql-tag';
import { formatDate, formatHexToInt, timestampToDate } from '../../../filters.js';
import FDataTable from '../../core/FDataTable/FDataTable.vue';
import { mapGetters } from 'vuex';
import { cloneObject } from '@/utils';

export default {
    name: 'BallotList',

    components: { FDataTable, FCard },

    props: {
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
        ballots: {
            query: gql`
                query BallotList($cursor: Cursor, $count: Int!) {
                    ballots(cursor: $cursor, count: $count) {
                        totalCount
                        pageInfo {
                            first
                            last
                            hasNext
                            hasPrevious
                        }
                        edges {
                            ballot {
                                address
                                name
                                detailsUrl
                                start
                                end
                                isOpen
                                isFinalized
                                winner
                                proposals {
                                    id
                                    name
                                }
                            }
                            cursor
                        }
                    }
                }
            `,
            variables() {
                return {
                    cursor: null,
                    count: this.itemsPerPage,
                };
            },
            async result(_data, _key) {
                let data;

                if (_key === 'ballots') {
                    data = cloneObject(_data.data.ballots);

                    const edges = await this.processEdges(data.edges);

                    this.hasNext = data.pageInfo.hasNext;

                    if (this.dItems.length === 0) {
                        this.dItems = edges;
                    } else {
                        for (let i = 0, len1 = edges.length; i < len1; i++) {
                            this.dItems.push(edges[i]);
                        }
                    }

                    this.totalCount = formatHexToInt(data.totalCount);
                    this.$emit('records-count', this.totalCount);
                }
            },
            error(_error) {
                this.ballotsError = _error.message;
            },
        },
    },

    data() {
        return {
            totalCount: 0,
            dItems: [],
            hasNext: false,
            ballotsError: '',
            columns: [
                {
                    name: 'name',
                    label: 'Name',
                    itemProp: 'ballot.name',
                    width: '320px',
                },
                {
                    name: 'startend',
                    label: 'Start / End',
                    itemProp: 'ballot.start',
                    formatter: (_value) => {
                        return formatDate(timestampToDate(_value), true, true);
                    },
                    width: '220px',
                },
                /*
                {
                    name: 'end',
                    label: 'End',
                    itemProp: 'ballot.end',
                    formatter: (_value) => {
                        return formatDate(timestampToDate(_value), true, true);
                    },
                    width: '220px',
                },
*/
                {
                    name: 'winner',
                    label: 'Winner',
                    itemProp: 'ballot.winner',
                    formatter: (_value, _item) => {
                        const { proposals } = _item.ballot;

                        if (_item.ballot.isFinalized && proposals && proposals.length) {
                            return this.getProposalById(parseInt(_value, 16), proposals).name || '-';
                        }

                        return '-';
                    },
                },
                {
                    name: 'vote',
                    label: 'Vote',
                    itemProp: 'ballot._proposal',
                },
            ],
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        /**
         * Property is set to `true`, if 'ballot-list-dt-mobile-view' breakpoint is reached.
         *
         * @return {Boolean}
         */
        cMobileView() {
            const dataTableBreakpoint = this.$store.state.breakpoints['ballot-list-dt-mobile-view'];

            return dataTableBreakpoint && dataTableBreakpoint.matches;
        },

        cLoading() {
            return this.$apollo.queries.ballots.loading;
        },
    },

    methods: {
        /**
         * Prepare 'vote' column.
         *
         * @param {array} _edges
         */
        async processEdges(_edges) {
            const ballotAddresses = [];

            _edges.forEach((_item) => {
                const { ballot } = _item;

                ballot._proposal = '';
                ballotAddresses.push(ballot.address);
            });

            if (ballotAddresses.length > 0) {
                // send votes request
                const data = await this.$apollo.query({
                    query: gql`
                        query VoteList($voter: Address!, $ballots: [Address!]!) {
                            votes(voter: $voter, ballots: $ballots) {
                                ballot
                                vote
                            }
                        }
                    `,
                    variables: {
                        voter: this.currentAccount.address,
                        ballots: ballotAddresses,
                    },
                    fetchPolicy: 'network-only',
                });

                if (data) {
                    const { votes } = data.data;

                    if (votes) {
                        votes.forEach((_item) => {
                            let edge;

                            for (let i = 0, len1 = _edges.length; i < len1; i++) {
                                edge = _edges[i];
                                if (edge.ballot.address.toLowerCase() === _item.ballot.toLowerCase()) {
                                    edge.ballot._proposal = this.getProposalById(
                                        parseInt(_item.vote, 16),
                                        edge.ballot.proposals
                                    ).name;
                                    break;
                                }
                            }
                        });
                    }
                }
            }

            return _edges;
        },

        fetchMore() {
            const { ballots } = this;

            if (ballots && ballots.pageInfo && ballots.pageInfo.hasNext) {
                const cursor = ballots.pageInfo.last;

                this.$apollo.queries.ballots.fetchMore({
                    variables: {
                        cursor,
                        count: this.itemsPerPage,
                    },
                    updateQuery: (previousResult, { fetchMoreResult }) => {
                        return fetchMoreResult;
                    },
                });
            }
        },

        /**
         * @param {int} _id
         * @param {array} _proposals
         * @return {Object}
         */
        getProposalById(_id, _proposals) {
            return _proposals.find((_item) => _item.id === _id) || {};
        },

        /**
         * @param {Event} _event
         */
        onDataTableClick(_event) {
            const eVoteBtn = _event.target.closest('.vote-btn');

            if (eVoteBtn) {
                const ballotAddress = eVoteBtn.getAttribute('data-ballot-address');
                const ballot = this.dItems.find((_item) => _item.ballot.address === ballotAddress);

                if (ballot && ballot.ballot.isOpen && !ballot.ballot._proposal) {
                    this.$emit('ballot-selected', ballot.ballot);
                }
            }
        },

        formatDate,
        timestampToDate,
    },
};
</script>
