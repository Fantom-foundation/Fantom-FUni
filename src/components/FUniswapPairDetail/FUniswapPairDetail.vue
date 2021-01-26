<template>
    <div class="funiswap-pair-detail">
        <h1 class="with-back-btn">
            <f-back-button :route-name="backButtonRoute" />
            <span class="funiswap-pair-detail__title">
                <f-uniswap-pair-symbol v-if="pair.pairAddress" :pair="pair" />
                <span class="funiswap-pair-detail__title__pair">Pair</span>
            </span>
        </h1>
        <br />

        <h3>Volumes</h3>
        <div class="chart-controls-top-bar">
            <span>
                History:
                <f-dropdown-listbox v-model="timeSpan" :data="timespanSelectData" button-class="btn small light" />
            </span>
            <span>
                Data:
                <f-dropdown-listbox v-model="resolution" :data="resolutionSelectData" button-class="btn small light" />
            </span>
        </div>

        <f-lightweight-charts
            ref="chart"
            :series="series"
            series-type="histogram"
            :series-options="{ priceFormat: { type: 'volume' } }"
            transform-values="to-eth"
            time-to-timestamp
            :add-missing-values="{ value: 0, timeResolution: timeResolution[resolution] }"
            :options="{
                timeScale: { timeVisible: ['15m', '1h', '4h'].indexOf(resolution) > -1, secondsVisible: false },
                handleScroll: true,
                handleScale: true,
            }"
            :fit-content="resolution === 'day'"
        />
    </div>
</template>

<script>
import FBackButton from '../core/FBackButton/FBackButton.vue';
import { getAppParentNode } from '../../app-structure.js';
import FUniswapPairSymbol from '../FUniswapPairSymbol/FUniswapPairSymbol.vue';
import FLightweightCharts from '../core/FLightweightCharts/FLightweightCharts.vue';
import gql from 'graphql-tag';
import { getTimeSpan } from '@/utils/time.js';
import FDropdownListbox from '@/components/core/FDropdownListbox/FDropdownListbox.vue';

export default {
    name: 'FUniswapPairDetail',

    components: { FDropdownListbox, FLightweightCharts, FUniswapPairSymbol, FBackButton },

    data() {
        return {
            /** @type {UniswapPair} */
            pair: {},
            series: [],
            timeSpan: 'all',
            resolution: 'day',
            timeResolution: {
                day: 86400,
                '4h': 14400,
                '1h': 3600,
                '15m': 900,
            },
            /** Data for timespan dropdown */
            timespanSelectData: [
                { value: '1W', label: '1W' },
                { value: '1M', label: '1M' },
                { value: 'all', label: 'All' },
            ],
            /** Data for resolution dropdown */
            resolutionSelectData: [
                { value: '15m', label: '15m' },
                { value: '1h', label: '1H' },
                { value: '4h', label: '4H' },
                { value: 'day', label: 'D' },
                { value: 'month', label: '1M' },
            ],
        };
    },

    computed: {
        params() {
            const { $route } = this;

            return $route && $route.params ? $route.params : {};
        },

        backButtonRoute() {
            const parentNode = getAppParentNode('funiswap-pair-detail');

            return parentNode ? parentNode.route : '';
        },
    },

    watch: {
        async timeSpan(_value) {
            this.loadSeries(_value);
        },

        async resolution(_value) {
            this.loadSeries(this.timeSpan, _value);
        },
    },

    created() {
        this.init();
    },

    methods: {
        async init() {
            const { $defi } = this;
            const result = await Promise.all([$defi.fetchUniswapPairs(), $defi.init()]);

            this.pair = result[0].find((_pair) => _pair.pairAddress === this.params.address) || {};

            this.loadSeries();
        },

        async loadSeries(_timeSpan = this.timeSpan, _resolution = this.resolution) {
            const timeSpan = getTimeSpan(_timeSpan);

            this.series = await this.fetchTimeVolumes(this.params.address, _resolution, timeSpan[0], timeSpan[1]);
        },

        /**
         * @param {string} _pairAddress
         * @param {string} [_resolution]
         * @param {number} [_fromDate]
         * @param {number} [_toDate]
         * @return {Promise<DefiTimeVolume[]>}
         */
        async fetchTimeVolumes(_pairAddress, _resolution = 'day', _fromDate, _toDate) {
            const query = {
                query: gql`
                    query GetTimeVolumes($address: Address!, $resolution: String, $fromDate: Int, $toDate: Int) {
                        defiTimeVolumes(
                            address: $address
                            resolution: $resolution
                            fromDate: $fromDate
                            toDate: $toDate
                        ) {
                            time
                            value
                        }
                    }
                `,
                variables: {
                    address: _pairAddress,
                    resolution: _resolution,
                    fromDate: _fromDate,
                    toDate: _toDate,
                },
            };
            const data = await this.$fFetch.fetchGQLQuery(query, 'defiTimeVolumes');

            return data.data.defiTimeVolumes || [];
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
