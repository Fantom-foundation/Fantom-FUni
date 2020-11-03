<template>
    <div class="funiswap-remove-liquidity funiswap">
        <f-card>
            <div class="funiswap__box">
                Amount
                <div class="funiswap-remove-liquidity__curr-liquidity">{{ currLiquidity }}%</div>
                <div class="funiswap-remove-liquidity__slider-wrap">
                    <f-slider
                        ref="slider"
                        v-model="currLiquidity"
                        :labels="sliderLabels"
                        clickable-labels
                        step="1"
                        use-lower-fill-bar
                    >
                        <!--
                            <template #top="sProps">
                                <label :for="sProps.inputId" class="not-visible">{{ label }}</label>
                            </template>
                            -->
                    </f-slider>
                </div>
            </div>

            <div class="funiswap__box funiswap-remove-liquidity__tokens">
                <div class="row no-collapse">
                    <div class="col">{{ fromTokenLiquidityFormatted }}</div>
                    <div class="col align-right">
                        <f-crypto-symbol :token="fromToken" img-width="24px" img-height="auto" />
                    </div>
                </div>
                <div class="row no-collapse">
                    <div class="col">{{ toTokenLiquidityFormatted }}</div>
                    <div class="col align-right">
                        <f-crypto-symbol :token="toToken" img-width="24px" img-height="auto" />
                    </div>
                </div>
            </div>

            <div class="funiswap-swap__exchange-price">
                <div class="defi-label">Price</div>
                <div class="value">
                    <f-token-value :value="1" :token="fromToken" :decimals="0" />
                    =
                    <f-token-value :value="convertFrom2To(1)" :token="toToken" :add-decimals="addDeciamals" />
                    <br />
                    <f-token-value :value="1" :token="toToken" :decimals="0" />
                    =
                    <f-token-value :value="convertTo2From(1)" :token="fromToken" :add-decimals="addDeciamals" />
                </div>
            </div>

            <div class="funiswap__submit-cont">
                <button ref="submitBut" class="btn large" :disabled="submitDisabled" @click="onSubmit">
                    {{ submitLabel }}
                </button>
            </div>
        </f-card>

        <div class="funiswap__bottom-box">
            <f-uniswap-pair-liquidity-info :pair="dPair" :from-token="fromToken" :to-token="toToken" />
        </div>
    </div>
</template>

<script>
import FCard from '@/components/core/FCard/FCard.vue';
import { getUniqueId } from '@/utils';
import { mapGetters } from 'vuex';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
import FSlider from '@/components/core/FSlider/FSlider.vue';
import FCryptoSymbol from '@/components/core/FCryptoSymbol/FCryptoSymbol.vue';
import FUniswapPairLiquidityInfo from '@/components/FUniswapPairLiquidityInfo/FUniswapPairLiquidityInfo.vue';
import { formatNumberByLocale } from '@/filters.js';
import { pollingMixin } from '@/mixins/polling.js';

export default {
    name: 'FUniswapRemoveLiquidity',

    components: { FUniswapPairLiquidityInfo, FCryptoSymbol, FSlider, FTokenValue, FCard },

    mixins: [pollingMixin],

    props: {
        pair: {
            type: Object,
            default() {
                return {};
            },
        },
    },

    data() {
        return {
            /** @type {DefiToken} */
            fromToken: {},
            /** @type {DefiToken} */
            toToken: {},
            /** @type {DefiToken[]} */
            tokens: [],
            sliderLabels: ['0%', '25%', '50%', '75%', '100%'],
            id: getUniqueId(),
            dPair: {},
            addDeciamals: 2,
            currLiquidity: '0',
            submitLabel: 'Remove',
        };
    },

    computed: {
        ...mapGetters(['currentAccount', 'fUniswapSlippageTolerance']),

        /**
         * @return {{fromToken: DefiToken, toToken: DefiToken}}
         */
        params() {
            const { $route } = this;

            return $route && $route.params ? $route.params : {};
        },

        fromTokenLiquidity() {
            const { dPair } = this;
            const { share } = this;
            const currLiquidity = parseFloat(this.currLiquidity);

            if (share > 0 && dPair.pairAddress && currLiquidity > 0) {
                return (
                    this.$defi.fromTokenValue(dPair.tokens[0].balanceOf, this.fromToken) * share * (currLiquidity / 100)
                    // this.$defi.fromTokenValue(dPair.tokens[0].balanceOf, this.fromToken)
                );
                // return this.$defi.fromTokenValue(dPair.reserves[0], this.fromToken) * share * (currLiquidity / 100);
            }

            return 0;
        },

        fromTokenLiquidityFormatted() {
            const { fromTokenLiquidity } = this;

            if (fromTokenLiquidity > 0) {
                return formatNumberByLocale(
                    fromTokenLiquidity,
                    this.$defi.getTokenDecimals(this.fromToken) + this.addDeciamals
                );
            }

            return '-';
        },

        toTokenLiquidity() {
            const { dPair } = this;
            const { share } = this;
            const currLiquidity = parseFloat(this.currLiquidity);

            if (share > 0 && dPair.pairAddress && currLiquidity > 0) {
                return (
                    this.$defi.fromTokenValue(dPair.tokens[1].balanceOf, this.toToken) * share * (currLiquidity / 100)
                    // this.$defi.fromTokenValue(dPair.tokens[1].balanceOf, this.toToken)
                );
                // return this.$defi.fromTokenValue(dPair.reserves[1], this.toToken) * share * (currLiquidity / 100);
            }

            return 0;
        },

        toTokenLiquidityFormatted() {
            const { toTokenLiquidity } = this;

            if (toTokenLiquidity > 0) {
                return formatNumberByLocale(
                    toTokenLiquidity,
                    this.$defi.getTokenDecimals(this.toToken) + this.addDeciamals
                );
            }

            return '-';
        },

        submitDisabled() {
            return !this.currentAccount || this.fromTokenLiquidity === 0 || this.toTokenLiquidity === 0;
        },

        share() {
            const { dPair } = this;

            return dPair.pairAddress ? parseInt(dPair.shareOf, 16) / parseInt(dPair.totalSupply, 16) : 0;
        },
    },

    watch: {
        currentAccount(_value, _oldValue) {
            if (_value !== _oldValue) {
                this.onAccountPicked();
            }
        },

        $route() {
            this.setPairAndTokensByRouteParams();
        },
    },

    created() {
        this.dPair = this.pair;

        this.init();

        if (!this.currentAccount) {
            this.submitLabel = 'Connect Wallet';
        }

        this._polling.start(
            'update-funiswap-remove-liquidity-prices',
            () => {
                this.setTokenPrices();
            },
            4000
        );
    },

    methods: {
        async init() {
            const { $defi } = this;
            const address = this.currentAccount ? this.currentAccount.address : '';
            const result = await Promise.all([$defi.fetchTokens(address), $defi.init()]);

            this.tokens = result[0];

            this.setPairAndTokensByRouteParams();
        },

        async setTokenPrices() {
            const { fromToken } = this;
            const { toToken } = this;
            const { dPair } = this;
            const address = this.currentAccount ? this.currentAccount.address : '';
            let price = 0;

            if (!dPair.pairAddress) {
                return;
            }

            const pair = await this.$defi.fetchUniswapPairs(address, dPair.pairAddress, [
                fromToken.address,
                toToken.address,
            ]);

            const fromTokenTotal = this.$defi.totalTokenLiquidity(fromToken, pair);
            const toTokenTotal = this.$defi.totalTokenLiquidity(toToken, pair);

            if (fromToken.address) {
                price = toTokenTotal / fromTokenTotal;
                if (price && price !== fromToken._perPrice) {
                    this.fromToken = { ...fromToken, _perPrice: price };
                }
            }

            if (toToken.address) {
                price = fromTokenTotal / toTokenTotal;
                if (price && price !== toToken._perPrice) {
                    this.toToken = { ...toToken, _perPrice: price };
                }
            }
        },

        async setPairAndTokensByRouteParams() {
            const { params } = this.$route;
            const address = this.currentAccount ? this.currentAccount.address : '';
            let uniswapPairs = null;
            let uniswapPair = null;

            if (params.tokena && params.tokenb) {
                uniswapPair = await this.$defi.fetchUniswapPairs(address, '', [params.tokena, params.tokenb]);
            } else {
                uniswapPairs = await this.$defi.fetchUniswapPairs(address);
                if (uniswapPairs && uniswapPairs.length > 0) {
                    uniswapPair = uniswapPairs[0];
                }
            }

            if (uniswapPair) {
                uniswapPair = await this.$defi.fetchUniswapPairs(address, uniswapPair.pairAddress, [
                    uniswapPair.tokens[0].address,
                    uniswapPair.tokens[1].address,
                ]);

                if (uniswapPair) {
                    this.dPair = uniswapPair;

                    const uniswapTokens = uniswapPair.tokens;
                    if (uniswapTokens && uniswapTokens.length === 2) {
                        this.fromToken = this.tokens.find((_item) => _item.address === uniswapTokens[0].address);
                        this.toToken = this.tokens.find((_item) => _item.address === uniswapTokens[1].address);

                        this.setTokenPrices();
                    }
                }
            }
        },

        convertFrom2To(_value) {
            const { fromToken } = this;

            return fromToken && fromToken._perPrice ? _value * fromToken._perPrice : 0;
            /*
            return fromToken && fromToken._perPrice
                ? _value * this.$defi.fromTokenValue(fromToken._perPrice, fromToken)
                : 0;
            */
        },

        convertTo2From(_value) {
            const { toToken } = this;

            return toToken && toToken._perPrice ? _value * toToken._perPrice : 0;
            // return toToken && toToken._perPrice ? _value * this.$defi.fromTokenValue(toToken._perPrice, toToken) : 0;
        },

        onSubmit() {
            const { fromToken } = this;
            const { toToken } = this;
            // const ftmTokens = ['FTM', 'WFTM'];
            const params = {
                fromToken: { ...fromToken },
                toToken: { ...toToken },
                slippageTolerance: this.fUniswapSlippageTolerance,
                fromTokenLiquidity: this.fromTokenLiquidity,
                toTokenLiquidity: this.toTokenLiquidity,
                pair: { ...this.dPair },
                currLiquidity: parseFloat(this.currLiquidity),
                // share: this.share * (parseFloat(this.currLiquidity) / 100),
                steps: 2,
                step: 1,
            };

            if (!this.submitDisabled) {
                this.$router.push({
                    name: 'funiswap-remove-liquidity-confirmation',
                    params,
                });
            }
        },

        onAccountPicked() {
            this.init();
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
