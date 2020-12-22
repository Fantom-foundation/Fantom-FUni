<template>
    <div class="funiswap-pair-detail">
        <h1 class="with-back-btn">
            <f-back-button :route-name="backButtonRoute" />
            <span class="funiswap-pair-detail__title">
                <f-uniswap-pair-symbol v-if="pair.pairAddress" :pair="pair" /><span
                    class="funiswap-pair-detail__title__pair"
                    >Pair</span
                >
            </span>
        </h1>
        <br />

        <f-lightweight-charts
            :series="series"
            series-type="histogram"
            transform-values="to-eth"
            time-to-timestamp
            :options="{ timeScale: { timeVisible: true } }"
            fit-content__
        />
    </div>
</template>

<script>
import FBackButton from '../core/FBackButton/FBackButton.vue';
import { getAppParentNode } from '../../app-structure.js';
import FUniswapPairSymbol from '../FUniswapPairSymbol/FUniswapPairSymbol.vue';
import FLightweightCharts from '../core/FLightweightCharts/FLightweightCharts.vue';
import gql from 'graphql-tag';

export default {
    name: 'FUniswapPairDetail',

    components: { FLightweightCharts, FUniswapPairSymbol, FBackButton },

    data() {
        return {
            /** @type {UniswapPair} */
            pair: {},
            series: {},
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

    created() {
        this.init();
    },

    methods: {
        async init() {
            const { $defi } = this;
            const result = await Promise.all([$defi.fetchUniswapPairs(), $defi.init()]);

            this.pair = result[0].find((_pair) => _pair.pairAddress === this.params.address) || {};

            this.series = await this.fetchTimeVolumes(this.params.address, '1h');
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
