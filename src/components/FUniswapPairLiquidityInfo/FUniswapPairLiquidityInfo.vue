<template>
    <div class="funiswap-pair-liquidity-info">
        <template v-if="pair.pairAddress">
            <h4>Your position</h4>
            <div class="row no-vert-col-padding no-collapse">
                <div class="col defi-label funiswap-pair-liquidity-info__position">
                    <f-crypto-symbol :token="fromToken" img-width="18px" img-height="auto" />
                    <span>/</span>
                    <f-crypto-symbol :token="toToken" img-width="18px" img-height="auto" />
                </div>
                <div class="col align-right">{{ $defi.fromTokenValue(pair.shareOf, fromToken).toFixed(1) }}</div>
            </div>
            <div class="row no-vert-col-padding no-collapse">
                <div class="col defi-label">Your pool share:</div>
                <div class="col align-right">{{ shareOfPool }}</div>
            </div>
            <div class="row no-vert-col-padding no-collapse">
                <div class="col defi-label">{{ $defi.getTokenSymbol(fromToken) }}</div>
                <div class="col align-right">{{ fromTokenLiquidityFormatted }}</div>
            </div>
            <div class="row no-vert-col-padding no-collapse">
                <div class="col defi-label">{{ $defi.getTokenSymbol(toToken) }}</div>
                <div class="col align-right">{{ toTokenLiquidityFormatted }}</div>
            </div>

            <br />
            <h4>Pool total</h4>
            <div class="row no-vert-col-padding no-collapse">
                <div class="col defi-label">{{ $defi.getTokenSymbol(fromToken) }}</div>
                <div class="col align-right">{{ totalFromTokenLiquidity }}</div>
            </div>
            <div class="row no-vert-col-padding no-collapse">
                <div class="col defi-label">{{ $defi.getTokenSymbol(toToken) }}</div>
                <div class="col align-right">{{ totalToTokenLiquidity }}</div>
            </div>
        </template>
    </div>
</template>

<script>
import FCryptoSymbol from '@/components/core/FCryptoSymbol/FCryptoSymbol.vue';
import { formatNumberByLocale } from '@/filters.js';
import { TokenPairs } from '@/utils/token-pairs.js';

export default {
    name: 'FUniswapPairLiquidityInfo',
    components: { FCryptoSymbol },
    props: {
        pair: {
            type: Object,
            default() {
                return {};
            },
            required: true,
        },
        fromToken: {
            type: Object,
            default() {
                return {};
            },
            required: true,
        },
        toToken: {
            type: Object,
            default() {
                return {};
            },
            required: true,
        },
    },

    data() {
        return {
            addDecimals: 0,
        };
    },

    computed: {
        fromTokenLiquidity() {
            const { pair } = this;
            const { share } = this;

            if (share > 0 && pair.pairAddress) {
                const pairToken = TokenPairs.findPairToken(pair, this.fromToken);

                return pairToken ? this.$defi.fromTokenValue(pairToken.balanceOf, this.fromToken) * share : 0;
            }

            return 0;
        },

        fromTokenLiquidityFormatted() {
            const { fromTokenLiquidity } = this;

            if (fromTokenLiquidity > 0) {
                return this.formatNumberByLocale(
                    fromTokenLiquidity,
                    this.$defi.getTokenDecimals(this.fromToken) + this.addDecimals
                );
            }

            return '-';
        },

        toTokenLiquidity() {
            const { pair } = this;
            const { share } = this;

            if (share > 0 && pair.pairAddress) {
                const pairToken = TokenPairs.findPairToken(pair, this.toToken);

                return pairToken ? this.$defi.fromTokenValue(pairToken.balanceOf, this.toToken) * share : 0;
            }

            return 0;
        },

        toTokenLiquidityFormatted() {
            const { toTokenLiquidity } = this;

            if (toTokenLiquidity > 0) {
                return this.formatNumberByLocale(
                    toTokenLiquidity,
                    this.$defi.getTokenDecimals(this.toToken) + this.addDecimals
                );
                // return toTokenLiquidity.toFixed(this.$defi.getTokenDecimals(this.toToken) + this.addDecimals);
            }

            return '-';
        },

        totalFromTokenLiquidity() {
            return this.formatNumberByLocale(this.$defi.totalTokenLiquidity(this.fromToken, this.pair), 0);
        },

        totalToTokenLiquidity() {
            return this.formatNumberByLocale(this.$defi.totalTokenLiquidity(this.toToken, this.pair), 0);
        },

        share() {
            const { pair } = this;

            return pair.pairAddress ? parseInt(pair.shareOf, 16) / parseInt(pair.totalSupply, 16) : 0;
        },

        shareOfPool() {
            const { share } = this;

            if (share > 0) {
                return `${this.formatNumberByLocale(share * 100, 3)}%`;
            }

            return '-';
        },
    },

    methods: {
        formatNumberByLocale,
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
