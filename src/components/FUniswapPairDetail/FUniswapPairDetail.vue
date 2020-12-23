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
            <label for="pd-week">
                <input id="pd-week" v-model="timeSpan" type="radio" name="resolution" value="1W" class="not-visible" />
                <span class="btn small secondary">1W</span>
            </label>
            <label for="pd-month">
                <input id="pd-month" v-model="timeSpan" type="radio" name="resolution" value="1M" class="not-visible" />
                <span class="btn small secondary">1M</span>
            </label>
            <label for="pd-all">
                <input id="pd-all" v-model="timeSpan" type="radio" name="resolution" value="all" class="not-visible" />
                <span class="btn small secondary">All</span>
            </label>

            <!--            <label for="pd-day">
                <input
                    id="pd-day"
                    v-model="resolution"
                    type="radio"
                    name="resolution"
                    value="day"
                    class="not-visible"
                />
                <span class="btn small secondary">day</span>
            </label>
            <label for="pd-hour">
                <input
                    id="pd-hour"
                    v-model="resolution"
                    type="radio"
                    name="resolution"
                    value="1h"
                    class="not-visible"
                />
                <span class="btn small secondary">1h</span>
            </label>
            -->
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
                timeScale: { timeVisible: ['1h'].indexOf(resolution) > -1, secondsVisible: false },
                handleScroll: false,
                handleScale: false,
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

export default {
    name: 'FUniswapPairDetail',

    components: { FLightweightCharts, FUniswapPairSymbol, FBackButton },

    data() {
        return {
            /** @type {UniswapPair} */
            pair: {},
            series: [],
            timeSpan: 'all',
            resolution: 'day',
            timeResolution: {
                day: 86400,
                '1h': 3600,
            },
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
