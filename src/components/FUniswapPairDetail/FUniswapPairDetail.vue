<template>
    <div class="funiswappairdetail">
        <h1 class="with-back-btn">
            <f-back-button :route-name="backButtonRoute" />
            <span class="funiswappairdetail_title">
                <f-uniswap-pair-symbol v-if="pair.pairAddress" :pair="pair" />
                <span class="funiswappairdetail_title_pair">Pair</span>
            </span>
        </h1>

        <div class="funiswappairdetail_prices">
            <f-card class="funiswappairdetail_prices_item">
                <f-crypto-symbol :token="token1" img-width="16px" img-height="16px" no-symbol />
                1 {{ token1Symbol }} =
                <f-token-value :token="token2" :value="totalToken2Liquidity / totalToken1Liquidity" no-currency />
                {{ token2Symbol }}
            </f-card>
            <f-card class="funiswappairdetail_prices_item">
                <f-crypto-symbol :token="token2" img-width="16px" img-height="16px" no-symbol />
                1 {{ token2Symbol }} =
                <f-token-value :token="token1" :value="totalToken1Liquidity / totalToken2Liquidity" no-currency />
                {{ token1Symbol }}
            </f-card>
        </div>

        <h2 class="funiswappairdetail_subtitle">Pair Stats</h2>
        <div class="funiswappairdetail_main">
            <div class="funiswappairdetail_stats">
                <f-card>
                    <h3 class="funiswappairdetail_subsubtitle">Total Liquidity</h3>
                    <div class="funiswappairdetail_stats_body">
                        <f-crypto-symbol :token="token1" img-width="21px" img-height="21px" no-symbol />
                        <!--                        {{ formatNumberByLocale(totalToken1Liquidity, 0) }} {{ token1Symbol }}-->
                        <f-token-value :token="token1" :value="totalToken1Liquidity" :decimals="0" />
                        <br />
                        <f-crypto-symbol :token="token2" img-width="21px" img-height="21px" no-symbol />
                        <!--                        {{ formatNumberByLocale(totalToken2Liquidity, 0) }} {{ token2Symbol }}-->
                        <f-token-value :token="token2" :value="totalToken2Liquidity" :decimals="0" />
                    </div>
                </f-card>
                <!--                <f-card>
                    <h3 class="funiswappairdetail_subsubtitle">Total Liquidity</h3>
                    <div class="funiswappairdetail_stats_body">
                        {{ totalLiquidity }}
                    </div>
                </f-card>-->
                <f-card>
                    <h3 class="funiswappairdetail_subsubtitle">Volume (24h)</h3>
                    <div class="funiswappairdetail_stats_body funiswappairdetail_stats_cols">
                        <f-token-value :token="token1" :value="volume24h" />
                        <f-price-diff :curr-value="volume24h" :prev-value="prevVolume24h" :decimals="1" />
                    </div>
                </f-card>
                <f-card>
                    <h3 class="funiswappairdetail_subsubtitle">Fees (24h)</h3>
                    <div class="funiswappairdetail_stats_body funiswappairdetail_stats_cols">
                        <f-token-value :token="token1" :value="volume24h * liquidityProviderFee" />
                        <f-price-diff :curr-value="volume24h" :prev-value="prevVolume24h" :decimals="1" />
                    </div>
                </f-card>
                <!--                <f-card>
                    <h3 class="funiswappairdetail_subsubtitle">Pooled Tokens</h3>
                    <div class="funiswappairdetail_stats_body">
                        <f-crypto-symbol :token="token1" img-width="21px" img-height="21px" no-symbol />
                        {{ formatNumberByLocale(totalToken1Liquidity, 0) }} {{ token1Symbol }}
                        <br />
                        <f-crypto-symbol :token="token2" img-width="21px" img-height="21px" no-symbol />
                        {{ formatNumberByLocale(totalToken2Liquidity, 0) }} {{ token2Symbol }}
                    </div>
                </f-card>-->
            </div>

            <f-card class="funiswappairdetail_charts">
                <f-tabs aria-label="Default tabs" @tab-set="activeTabId = $event.tabId">
                    <f-tab id="t-reserves" :title="`Liquidity (${token1Symbol})`">
                        <f-lightweight-charts
                            :series="reserveSeries"
                            series-type="area"
                            transform-values="to-eth"
                            time-to-timestamp
                            :height="280"
                            :add-missing-values="{ value: 'last', timeResolution: timeResolution[resolution] }"
                            :options="{
                                timeScale: {
                                    timeVisible: ['15m', '1h', '4h'].indexOf(resolution) > -1,
                                    secondsVisible: false,
                                },
                                handleScroll: true,
                                handleScale: true,
                            }"
                        />
                    </f-tab>
                    <f-tab id="t-volumes" title="Volume">
                        <f-lightweight-charts
                            ref="chart"
                            :series="volumeSeries"
                            series-type="histogram"
                            :series-options="{ priceFormat: { type: 'volume' } }"
                            transform-values="to-eth"
                            time-to-timestamp
                            :height="280"
                            :add-missing-values="{ value: 0, timeResolution: timeResolution[resolution] }"
                            :options="{
                                timeScale: {
                                    timeVisible: ['15m', '1h', '4h'].indexOf(resolution) > -1,
                                    secondsVisible: false,
                                },
                                handleScroll: true,
                                handleScale: true,
                            }"
                            :fit-content="resolution === 'day'"
                        />
                    </f-tab>
                    <f-tab id="t-price1" :title="token1token2">
                        <f-lightweight-charts
                            :series="price1Series"
                            series-type="candlestick"
                            transform-values="to-eth"
                            time-to-timestamp
                            :height="280"
                            :options="{
                                handleScroll: true,
                                handleScale: true,
                            }"
                        />
                    </f-tab>
                    <f-tab id="t-price2" :title="token2token1">
                        <f-lightweight-charts
                            :series="price2Series"
                            series-type="candlestick"
                            transform-values="to-eth"
                            time-to-timestamp
                            :height="280"
                            :options="{
                                handleScroll: true,
                                handleScale: true,
                            }"
                        />
                    </f-tab>
                </f-tabs>

                <div class="chart-controls-top-bar">
                    <span>
                        History:
                        <f-dropdown-listbox
                            v-model="timeSpan"
                            :data="timespanSelectData"
                            button-class="btn small light"
                        />
                    </span>
                    <span>
                        Data:
                        <f-dropdown-listbox
                            v-model="resolution"
                            :data="resolutionSelectData"
                            button-class="btn small light"
                        />
                    </span>
                </div>
            </f-card>
        </div>

        <h2 class="funiswappairdetail_subtitle">Pair information</h2>
        <f-card class="funiswappairdetail_info">
            <div class="funiswappairdetail_info_item">
                <h3 class="funiswappairdetail_subsubtitle">Pair Name</h3>
                <div><f-uniswap-pair-symbol v-if="pair.pairAddress" :pair="pair" no-symbols /></div>
            </div>
            <div class="funiswappairdetail_info_item">
                <h3 class="funiswappairdetail_subsubtitle">Pair Address</h3>
                <div>
                    <a :href="`${explorerUrl}address/${pair.pairAddress}`" target="_blank" class="break-word">
                        <f-ellipsis :text="pair.pairAddress" overflow="middle" />
                    </a>
                    <f-copy-button
                        :text="pair.pairAddress"
                        tooltip="Copy address to clipboard"
                        :default-icon-size="14"
                        class="btn small light same-size round"
                    />
                </div>
            </div>
            <div class="funiswappairdetail_info_item">
                <h3 class="funiswappairdetail_subsubtitle">{{ token1Symbol }} Address</h3>
                <div>
                    <f-ellipsis :text="token1.address" overflow="middle" />
                    <f-copy-button
                        :text="token1.address"
                        tooltip="Copy address to clipboard"
                        :default-icon-size="14"
                        class="btn small light same-size round"
                    />
                </div>
            </div>
            <div class="funiswappairdetail_info_item">
                <h3 class="funiswappairdetail_subsubtitle">{{ token2Symbol }} Address</h3>
                <div>
                    <f-ellipsis :text="token2.address" overflow="middle" />
                    <f-copy-button
                        :text="token2.address"
                        tooltip="Copy address to clipboard"
                        :default-icon-size="14"
                        class="btn small light same-size round"
                    />
                </div>
            </div>
        </f-card>

        <h2 class="funiswappairdetail_subtitle">Transactions</h2>
        <f-card>
            <f-uniswap-transaction-list :pair="pair" />
        </f-card>
    </div>
</template>

<script>
import FBackButton from '@/components/core/FBackButton/FBackButton.vue';
import { getAppParentNode } from '@/app-structure.js';
import FUniswapPairSymbol from '../FUniswapPairSymbol/FUniswapPairSymbol.vue';
import FLightweightCharts from '@/components/core/FLightweightCharts/FLightweightCharts.vue';
import gql from 'graphql-tag';
import { getTimeSpan, nowDJS } from '@/utils/time.js';
import FDropdownListbox from '@/components/core/FDropdownListbox/FDropdownListbox.vue';
import FTabs from '@/components/core/FTabs/FTabs.vue';
import FTab from '@/components/core/FTabs/FTab.vue';
import FCard from '@/components/core/FCard/FCard.vue';
import { formatNumberByLocale } from '@/filters.js';
import { mapGetters } from 'vuex';
import FCryptoSymbol from '@/components/core/FCryptoSymbol/FCryptoSymbol.vue';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
import FEllipsis from '@/components/core/FEllipsis/FEllipsis.vue';
import FCopyButton from '@/components/core/FCopyButton/FCopyButton.vue';
import appConfig from '../../../app.config.js';
import { WeiToFtm } from '@/utils/transactions.js';
import FUniswapTransactionList from '@/components/data-tables/FUniswapTransactionList/FUniswapTransactionList.vue';
import dayjs from 'dayjs';
import FPriceDiff from '@/components/core/FPriceDiff/FPriceDiff.vue';

export default {
    name: 'FUniswapPairDetail',

    components: {
        FPriceDiff,
        FUniswapTransactionList,
        FCopyButton,
        FEllipsis,
        FTokenValue,
        FCryptoSymbol,
        FCard,
        FTab,
        FTabs,
        FDropdownListbox,
        FLightweightCharts,
        FUniswapPairSymbol,
        FBackButton,
    },

    data() {
        return {
            /** @type {UniswapPair} */
            pair: {},
            volumeSeries: [],
            reserveSeries: [],
            price1Series: [],
            price2Series: [],
            activeTabId: '',
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
            totalLiquidity: 0,
            volume24h: 0,
            prevVolume24h: 0,
            liquidityProviderFee: appConfig.settings.fUniswapLiquidityProviderFee,
            explorerUrl: appConfig.explorerUrl,
            explorerTransactionPath: appConfig.explorerTransactionPath,
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        params() {
            const { $route } = this;

            return $route && $route.params ? $route.params : {};
        },

        backButtonRoute() {
            const parentNode = getAppParentNode('funiswap-pair-detail');

            return parentNode ? parentNode.route : '';
        },

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

        totalToken1Liquidity() {
            return this.getTotalPairTokenLiquidity(this.pair);
        },

        totalToken2Liquidity() {
            return this.getTotalPairTokenLiquidity(this.pair, 1);
        },

        token1token2() {
            return `${this.token1Symbol}/${this.token2Symbol}`;
        },

        token2token1() {
            return `${this.token2Symbol}/${this.token1Symbol}`;
        },
    },

    watch: {
        async timeSpan() {
            this.loadChartDataByTabId(this.activeTabId);
        },

        async resolution() {
            this.loadChartDataByTabId(this.activeTabId);
        },

        activeTabId(_tabId) {
            this.loadChartDataByTabId(_tabId);
        },
    },

    created() {
        this.init();
    },

    methods: {
        async init() {
            const { $defi } = this;
            const address = this.currentAccount ? this.currentAccount.address : '';
            const result = await Promise.all([$defi.fetchUniswapPairs(), $defi.init()]);

            const pair = result[0].find((_pair) => _pair.pairAddress === this.params.pairAddress) || {};

            if (pair.pairAddress) {
                this.pair = await this.$defi.fetchUniswapPairs(address, pair.pairAddress, [
                    pair.tokens[0].address,
                    pair.tokens[1].address,
                ]);
            }

            this.setPairStats();
        },

        async loadReserveSeries(_timeSpan = this.timeSpan, _resolution = this.resolution) {
            const timeSpan = getTimeSpan(_timeSpan);

            const reserveSeries = await this.fetchReserves(
                this.params.pairAddress,
                _resolution,
                timeSpan[0],
                timeSpan[1]
            );

            this.reserveSeries = reserveSeries.map((_item) => {
                return {
                    time: _item.time,
                    value: _item.reserveClose[0],
                };
            });
        },

        async loadVolumeSeries(_timeSpan = this.timeSpan, _resolution = this.resolution) {
            const timeSpan = getTimeSpan(_timeSpan);

            this.volumeSeries = await this.fetchVolumes(this.params.pairAddress, _resolution, timeSpan[0], timeSpan[1]);
        },

        async loadPrice1Series(_timeSpan = this.timeSpan, _resolution = this.resolution) {
            const timeSpan = getTimeSpan(_timeSpan);

            this.price1Series = await this.fetchPrices(this.params.pairAddress, _resolution, timeSpan[0], timeSpan[1]);
        },

        async loadPrice2Series(_timeSpan = this.timeSpan, _resolution = this.resolution) {
            const timeSpan = getTimeSpan(_timeSpan);

            this.price2Series = await this.fetchPrices(
                this.params.pairAddress,
                _resolution,
                timeSpan[0],
                timeSpan[1],
                1
            );
        },

        /**
         * @param {string} _tabId
         */
        loadChartDataByTabId(_tabId) {
            if (_tabId === 't-reserves') {
                this.loadReserveSeries();
            } else if (_tabId === 't-volumes') {
                this.loadVolumeSeries();
            } else if (_tabId === 't-price1') {
                this.loadPrice1Series();
            } else if (_tabId === 't-price2') {
                this.loadPrice2Series();
            }
        },

        async setPairStats() {
            const { reserveSeries } = this;
            const now = nowDJS();
            const nowMinus1d = now.subtract(1, 'd');
            const nowMinus2d = now.subtract(2, 'd');

            if (reserveSeries.length > 0) {
                this.totalLiquidity = WeiToFtm(reserveSeries[reserveSeries.length - 1].value);
            }

            const data = await Promise.all([
                this.getVolumesByDateInterval(nowMinus1d.unix(), now.unix()),
                this.getVolumesByDateInterval(nowMinus2d.unix(), nowMinus1d.unix()),
            ]);
            const nowMinus1dData = data[0];
            const nowMinus2dData = data[1];

            this.volume24h = nowMinus1dData.reduce((_prev, _item) => {
                return _prev + WeiToFtm(_item.value);
            }, 0);

            this.prevVolume24h = nowMinus2dData.reduce((_prev, _item) => {
                return _prev + WeiToFtm(_item.value);
            }, 0);
        },

        /**
         * @param {number} _fromDate
         * @param {number} _toDate
         * @return {Promise<*[]>}
         */
        async getVolumesByDateInterval(_fromDate, _toDate) {
            /** @type {array} */
            const data = await this.fetchVolumes(this.params.pairAddress, '5m', _fromDate, _toDate);

            return data.filter((_item) => {
                const ts = dayjs(_item.time).unix();

                return ts >= _fromDate && ts <= _toDate;
            });
        },

        /**
         * @param {string} _pairAddress
         * @param {string} [_resolution]
         * @param {number} [_fromDate]
         * @param {number} [_toDate]
         * @return {Promise<DefiTimeVolume[]>}
         */
        async fetchVolumes(_pairAddress, _resolution = 'day', _fromDate, _toDate) {
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

        /**
         * @param {string} _pairAddress
         * @param {string} [_resolution]
         * @param {number} [_fromDate]
         * @param {number} [_toDate]
         * @return {Promise<DefiTimeReserve[]>}
         */
        async fetchReserves(_pairAddress, _resolution = 'day', _fromDate, _toDate) {
            const query = {
                query: gql`
                    query GetTimeReserves($address: Address!, $resolution: String, $fromDate: Int, $toDate: Int) {
                        defiTimeReserves(
                            address: $address
                            resolution: $resolution
                            fromDate: $fromDate
                            toDate: $toDate
                        ) {
                            uniswapPair {
                                pairAddress
                            }
                            time
                            reserveClose
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
            const data = await this.$fFetch.fetchGQLQuery(query, 'defiTimeReserves');

            return data.data.defiTimeReserves || [];
        },

        /**
         * @param {string} _pairAddress
         * @param {string} [_resolution]
         * @param {number} [_fromDate]
         * @param {number} [_toDate]
         * @param {number} [_direction]
         * @return {Promise<DefiTimePrice[]>}
         */
        async fetchPrices(_pairAddress, _resolution = 'day', _fromDate, _toDate, _direction = 0) {
            const query = {
                query: gql`
                    query GetTimeReserves(
                        $address: Address!
                        $resolution: String
                        $fromDate: Int
                        $toDate: Int
                        $direction: Int
                    ) {
                        defiTimePrices(
                            address: $address
                            resolution: $resolution
                            fromDate: $fromDate
                            toDate: $toDate
                            direction: $direction
                        ) {
                            time
                            open
                            close
                            low
                            high
                            average
                        }
                    }
                `,
                variables: {
                    address: _pairAddress,
                    resolution: _resolution,
                    fromDate: _fromDate,
                    toDate: _toDate,
                    direction: _direction,
                },
            };
            const data = await this.$fFetch.fetchGQLQuery(query, 'defiTimePrices');

            return data.data.defiTimePrices || [];
        },

        /**
         * @param {UniswapPair} _pair
         * @param {number} _tokenIndex
         * @return {string}
         */
        getTotalPairTokenLiquidity(_pair, _tokenIndex = 0) {
            return _pair && _pair.tokens ? this.$defi.totalTokenLiquidity(_pair.tokens[_tokenIndex], _pair) : 0;
        },

        formatUSD(_value, _decimals = 0) {
            return formatNumberByLocale(_value, _decimals, 'USD');
        },

        formatNumberByLocale,
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
