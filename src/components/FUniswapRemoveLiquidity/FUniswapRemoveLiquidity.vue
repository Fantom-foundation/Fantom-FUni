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

        <!--
        <div class="funiswap__bottom-box">
        </div>
        -->
    </div>
</template>

<script>
import FCard from '@/components/core/FCard/FCard.vue';
import { getUniqueId } from '@/utils';
import { mapGetters } from 'vuex';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
import FSlider from '@/components/core/FSlider/FSlider.vue';
import FCryptoSymbol from '@/components/core/FCryptoSymbol/FCryptoSymbol.vue';

export default {
    name: 'FUniswapRemoveLiquidity',

    components: { FCryptoSymbol, FSlider, FTokenValue, FCard },

    props: {
        slippageTolerance: {
            type: Number,
            default: 0.005,
        },
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
            sliderLabels: ['0%', '25%', '50%', '75%', '100%'],
            id: getUniqueId(),
            dPair: {},
            addDeciamals: 2,
            currLiquidity: '0',
            submitLabel: 'Remove',
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

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
                return fromTokenLiquidity.toFixed(this.$defi.getTokenDecimals(this.fromToken) + this.addDeciamals);
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
                return toTokenLiquidity.toFixed(this.$defi.getTokenDecimals(this.toToken) + this.addDeciamals);
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

        fromTokenBalance() {
            const { fromToken } = this;
            let balance =
                this.$defi.fromTokenValue(fromToken.availableBalance, fromToken) - (fromToken.symbol === 'FTM' ? 2 : 0);

            if (balance < 0) {
                balance = 0;
            }

            return balance;
        },

        toTokenBalance() {
            return this.$defi.fromTokenValue(this.toToken.availableBalance, this.toToken);
        },
    },

    watch: {
        currentAccount(_value, _oldValue) {
            if (_value !== _oldValue) {
                this.onAccountPicked();
            }
        },
    },

    created() {
        this.dPair = this.pair;

        this.init();

        if (!this.currentAccount) {
            this.submitLabel = 'Connect Wallet';
        }
    },

    methods: {
        async init() {
            const { $defi } = this;
            const address = this.currentAccount ? this.currentAccount.address : '';
            const result = await Promise.all([$defi.fetchTokens(address), $defi.init()]);

            const tokens = result[0];

            if (!this.dPair.pairAddress) {
                let uniswapPairs = await this.$defi.fetchUniswapPairs(address, this.dPair.pairAddress);

                if (uniswapPairs && uniswapPairs.length > 0) {
                    uniswapPairs = await this.$defi.fetchUniswapPairs(address, uniswapPairs[0].pairAddress);

                    this.dPair = uniswapPairs[0];
                }
            }

            const uniswapTokens = this.dPair.tokens;
            if (uniswapTokens && uniswapTokens.length === 2) {
                this.fromToken = tokens.find((_item) => _item.address === uniswapTokens[0].address);
                this.toToken = tokens.find((_item) => _item.address === uniswapTokens[1].address);

                this.setTokenPrices();
            }
        },

        async getUniswapPair() {
            const addressA = this.fromToken.address;
            const addressB = this.toToken.address;

            if (addressA && addressB) {
                return await this.$defi.fetchUniswapPairs(this.currentAccount ? this.currentAccount.address : '', [
                    addressA,
                    addressB,
                ]);
            }

            return {};
        },

        async setTokenPrices() {
            let price = await this.$defi.getUniswapTokenPrice(this.fromToken.address, this.dPair);
            this.fromToken = { ...this.fromToken, _perPrice: price };

            price = await this.$defi.getUniswapTokenPrice(this.toToken.address, this.dPair);
            this.toToken = { ...this.toToken, _perPrice: price };
        },

        convertFrom2To(_value) {
            const { fromToken } = this;

            return fromToken && fromToken._perPrice
                ? _value * this.$defi.fromTokenValue(fromToken._perPrice, fromToken)
                : 0;
        },

        convertTo2From(_value) {
            const { toToken } = this;

            return toToken && toToken._perPrice ? _value * this.$defi.fromTokenValue(toToken._perPrice, toToken) : 0;
        },

        onSubmit() {
            const { fromToken } = this;
            const { toToken } = this;
            // const ftmTokens = ['FTM', 'WFTM'];
            const params = {
                fromToken: { ...fromToken },
                toToken: { ...toToken },
                slippageTolerance: this.slippageTolerance,
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
