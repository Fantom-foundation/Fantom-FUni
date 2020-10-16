<template>
    <div class="funiswap-add-liquidity funiswap">
        <f-card>
            <div class="funiswap__box">
                <div class="funiswap__token__balance">
                    <span>Input</span>
                    <span class="balance">
                        Balance:
                        <f-token-value
                            :token="fromToken"
                            :value="fromTokenBalance"
                            :use-placeholder="false"
                            :add-decimals="addDeciamals"
                            no-currency
                        />
                    </span>
                </div>
                <div class="funiswap__token__body">
                    <input
                        :id="`text-input-${id}`"
                        ref="fromInput"
                        v-model="fromValue"
                        type="number"
                        placeholder="0"
                        step="any"
                        min="0"
                        :max="maxFromInputValue"
                        class="text-input no-style"
                        @change="onFromInputChange"
                        @keydown="onInputKeydown"
                    />
                    <button class="btn small secondary max-amount" @click="onFromMaxAmountClick">Max</button>
                    <f-select-button
                        collapsed
                        aria-label="pick a token"
                        class="bigger-arrow"
                        @click.native="onFromTokenSelectorClick"
                    >
                        <f-crypto-symbol :token="fromToken" img-width="24px" img-height="auto" />
                    </f-select-button>
                </div>
            </div>

            <div class="funiswap__swap-cont">
                <icon data="@/assets/svg/plus.svg" width="12" height="12" dir="left" aria-hidden="true" />
            </div>

            <div class="funiswap__box">
                <div class="funiswap__token__balance">
                    <span>Input</span>
                    <span class="balance">
                        Balance:
                        <f-token-value
                            :token="toToken"
                            :value="toTokenBalance"
                            :use-placeholder="false"
                            :add-decimals="addDeciamals"
                            no-currency
                        />
                    </span>
                </div>
                <div class="funiswap__token__body">
                    <input
                        :id="`text-input-${id}`"
                        ref="toInput"
                        v-model="toValue"
                        type="number"
                        placeholder="0"
                        step="any"
                        min="0"
                        :max="maxFromInputValue"
                        class="text-input no-style"
                        @change="onToInputChange"
                        @keydown="onInputKeydown"
                    />
                    <template v-if="toToken.address">
                        <button class="btn small secondary max-amount" @click="onToMaxAmountClick">Max</button>
                        <f-select-button
                            collapsed
                            aria-label="pick a token"
                            class="bigger-arrow"
                            @click.native="onToTokenSelectorClick"
                        >
                            <f-crypto-symbol :token="toToken" img-width="24px" img-height="auto" />
                        </f-select-button>
                    </template>
                    <button
                        v-else
                        class="btn small secondary funiswap__select-token-btn"
                        type="button"
                        @click="onToTokenSelectorClick"
                    >
                        Select a token <icon data="@/assets/svg/chevron-down.svg" width="12" height="12" />
                    </button>
                </div>
            </div>

            <div v-show="toToken.address" class="funiswap__box funiswap-add-liquidity__prices">
                Prices and pool share
                <div class="row no-collapse">
                    <div class="col">
                        <div>{{ toPerFromPrice }}</div>
                        <div class="defi-label">
                            {{ $defi.getTokenSymbol(toToken) }} per {{ $defi.getTokenSymbol(fromToken) }}
                        </div>
                    </div>
                    <div class="col">
                        <div>{{ fromPerToPrice }}</div>
                        <div class="defi-label">
                            {{ $defi.getTokenSymbol(fromToken) }} per {{ $defi.getTokenSymbol(toToken) }}
                        </div>
                    </div>
                    <div class="col">
                        <div>{{ shareOfPool }}</div>
                        <div class="defi-label">Share of Pool</div>
                    </div>
                </div>
            </div>

            <div class="funiswap__submit-cont">
                <button ref="submitBut" class="btn large" :disabled="submitBtnDisabled" @click="onSubmit">
                    {{ submitLabel }}
                </button>
            </div>
        </f-card>

        <div class="funiswap__bottom-box">
            By adding liquidity you'll earn 0.3% of all trades on this pair proportional to your share of the pool. Fees
            are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
        </div>

        <defi-token-picker-window
            ref="pickFromTokenWindow"
            :tokens="fromTokens"
            @defi-token-picked="onFromTokenPicked"
        />
        <defi-token-picker-window ref="pickToTokenWindow" :tokens="toTokens" @defi-token-picked="onToTokenPicked" />
    </div>
</template>

<script>
import FCard from '@/components/core/FCard/FCard.vue';
import { defer, getUniqueId } from '@/utils';
import { mapGetters } from 'vuex';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
import FSelectButton from '@/components/core/FSelectButton/FSelectButton.vue';
import FCryptoSymbol from '@/components/core/FCryptoSymbol/FCryptoSymbol.vue';
import DefiTokenPickerWindow from '@/components/windows/DefiTokenPickerWindow/DefiTokenPickerWindow.vue';

export default {
    name: 'FUniswapAddLiquidity',

    components: { DefiTokenPickerWindow, FCryptoSymbol, FSelectButton, FTokenValue, FCard },

    props: {
        slippageTolerance: {
            type: Number,
            default: 0.005,
        },
    },

    data() {
        return {
            fromValue: '',
            toValue: '',
            fromValue_: 0,
            toValue_: 0,
            toPerFromPrice: 0,
            fromPerToPrice: 0,
            /** Per price direction. true - from -> to, false - to -> from */
            perPriceDirF2T: true,
            submitBtnDisabled: true,
            showPriceInfo: false,
            /** @type {DefiToken} */
            fromToken: {},
            /** @type {DefiToken} */
            toToken: {},
            /** @type {DefiToken[]} */
            tokens: [],
            sliderLabels: ['0%', '25%', '50%', '75%', '100%'],
            id: getUniqueId(),
            liquidityProviderFee: 0.003,
            submitLabel: 'Enter an amount',
            dPair: {},
            addDeciamals: 2,
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

        fromTokens() {
            return this.getPickerTokens('from');
        },

        toTokens() {
            return this.getPickerTokens('to');
        },

        maxFromInputValue() {
            return this.fromTokenBalance;
        },

        maxToInputValue() {
            return this.toTokenBalance;
        },

        submitDisabled() {
            return !this.currentAccount || this.correctFromInputValue(this.fromValue_) === 0;
        },

        shareOfPool() {
            const { dPair } = this;

            if (dPair.pairAddress && dPair.shareOf) {
                const share = parseInt(dPair.shareOf, 16) / parseInt(dPair.totalSupply, 16);

                return `${(share * 100).toFixed(3)} %`;
            }

            return '-';
        },
    },

    watch: {
        fromValue(_value, _oldValue) {
            if (_value !== _oldValue) {
                this.fromValue_ = !_value ? 0 : parseFloat(_value);

                this.toValue_ = this.convertFrom2To(this.fromValue_);

                this.updateInputColor(this.fromValue_);
                this.updateInputColor(this.toValue_, true);
                this.updateSubmitLabel();

                this.setPrices();

                this.setToInputValue(this.correctToInputValue(this.toValue_));
            }
        },

        toValue(_value, _oldValue) {
            if (_value !== _oldValue) {
                this.toValue_ = !_value ? 0 : parseFloat(_value);

                this.fromValue_ = this.convertTo2From(this.toValue_);

                this.updateInputColor(this.toValue_, true);
                this.updateInputColor(this.fromValue_);
                this.updateSubmitLabel();

                this.setPrices();

                this.setFromInputValue(this.correctFromInputValue(this.fromValue_));
            }
        },

        async fromToken(_value, _oldValue) {
            if (_value !== _oldValue) {
                if (_value.address && this.toToken.address) {
                    const dPair = await this.getUniswapPair();

                    if (dPair.pairAddress !== this.dPair.pairAddress) {
                        this.dPair = dPair;
                        this.setTokenPrices();
                    }

                    defer(() => {
                        this.updateSubmitLabel();
                    });
                }
            }
        },

        async toToken(_value, _oldValue) {
            if (_value !== _oldValue) {
                if (_value.address && this.fromToken.address) {
                    const dPair = await this.getUniswapPair();

                    if (dPair.pairAddress !== this.dPair.pairAddress) {
                        this.dPair = dPair;
                        this.setTokenPrices();
                    }

                    this.toValue_ = this.convertFrom2To(this.fromValue_);

                    this.updateInputColor(this.fromValue_);
                    this.updateInputColor(this.toValue_, true);
                    this.updateSubmitLabel();

                    this.setPrices();

                    const cValue = this.correctToInputValue(this.toValue_);
                    if (this.toValue_ > cValue) {
                        this.toValue = cValue;
                    }

                    this.setToInputValue(this.correctToInputValue(this.toValue_));
                    this.setFromInputValue(this.fromValue_);
                }
            }
        },

        currentAccount(_value, _oldValue) {
            if (_value !== _oldValue) {
                this.onAccountPicked();
            }
        },
    },

    created() {
        this.init();

        if (!this.currentAccount) {
            this.submitLabel = 'Connect Wallet';
        }
    },

    methods: {
        async init() {
            const { $defi } = this;
            const { params } = this;
            const result = await Promise.all([
                $defi.fetchTokens(this.currentAccount ? this.currentAccount.address : ''),
                $defi.init(),
            ]);

            this.tokens = result[0];

            // if (params.fromToken && params.toToken) {
            if (params.fromToken) {
                this.fromToken = this.tokens.find((_item) => _item.symbol === params.fromToken.symbol);
                // this.toToken = this.tokens.find((_item) => _item.symbol === params.toToken.symbol);
            } else if (this.tokens.length >= 2) {
                this.fromToken = this.tokens[0];
                // this.toToken = this.tokens[1];
            }

            this.setPrices();
        },

        async getUniswapPair() {
            const addressA = this.fromToken.address;
            const addressB = this.toToken.address;

            if (addressA && addressB) {
                return await this.$defi.fetchUniswapPairs(this.currentAccount ? this.currentAccount.address : '', '', [
                    addressA,
                    addressB,
                ]);
            }

            return {};
        },

        /**
         * Get token list for `defi-token-picker-window`.
         *
         * @type {('from'|'to')} [_type]
         * @return {DefiToken[]}
         */
        getPickerTokens(_type = 'from') {
            // const fromTokenAddress = this.fromToken.address;
            let token = _type === 'from' ? this.fromToken : this.toToken;
            let fromTokenAddress = token.address;

            // if no 'to' token is selected
            if (_type === 'to' && !this.toToken.address) {
                fromTokenAddress = this.fromToken.address;
            }

            return this.tokens.map((_item) => {
                return { ..._item, _disabled: _item.address === fromTokenAddress };
            });
        },

        resetInputValues() {
            this.fromValue = '';
            this.toValue = '';
        },

        swapTokens() {
            const hToken = this.fromToken;
            const hValue = this.fromValue_;

            this.fromToken = this.toToken;
            this.toToken = hToken;

            this.fromValue = this.correctFromInputValue(this.toValue_) || '';
            this.toValue = this.correctToInputValue(hValue) || '';

            this.setFromInputValue(this.fromValue);
            this.setToInputValue(this.toValue);

            this.setPrices();
        },

        /**
         * @param {number} _value
         */
        formatToInputValue(_value) {
            const value = parseFloat(_value);

            return value !== 0 ? value.toFixed(this.$defi.getTokenDecimals(this.toToken) + this.addDeciamals) : '';
        },

        /**
         * @param {number} _value
         */
        formatFromInputValue(_value) {
            const value = parseFloat(_value);

            return value !== 0 ? value.toFixed(this.$defi.getTokenDecimals(this.fromToken) + this.addDeciamals) : '';
        },

        /**
         * @param {number} _value
         */
        correctFromInputValue(_value) {
            return Math.min(Math.max(_value, 0), this.maxFromInputValue);
        },

        /**
         * @param {number} _value
         */
        correctToInputValue(_value) {
            return Math.min(Math.max(_value, 0), Math.min(this.maxToInputValue, this.toTokenBalance));
        },

        async setTokenPrices() {
            let price = await this.$defi.getUniswapTokenPrice(this.fromToken.address, this.dPair);
            this.fromToken = { ...this.fromToken, _perPrice: price };

            price = await this.$defi.getUniswapTokenPrice(this.toToken.address, this.dPair);
            this.toToken = { ...this.toToken, _perPrice: price };

            this.setPrices();
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

        setFromInputValue(_value) {
            defer(() => {
                this.$refs.fromInput.value = this.formatFromInputValue(_value);
            });
        },

        setToInputValue(_value) {
            defer(() => {
                this.$refs.toInput.value = this.formatToInputValue(_value);
            });
        },

        setPrices() {
            this.toPerFromPrice = this.convertFrom2To(1).toFixed(4);
            this.fromPerToPrice = this.convertTo2From(1).toFixed(4);
        },

        updateInputColor(_value, _toInput = false) {
            const cValue = _toInput ? this.correctToInputValue(_value) : this.correctFromInputValue(_value);
            const eInput = _toInput ? this.$refs.toInput : this.$refs.fromInput;

            if (_value > cValue) {
                eInput.classList.add('invalid');
            } else {
                eInput.classList.remove('invalid');
            }
        },

        updateSubmitLabel() {
            // const fromInputValue = this.$refs.fromInput.value;
            // const toInputValue = this.$refs.toInput.value;
            const fromInputValue = this.fromValue_;
            const toInputValue = this.toValue_;

            this.submitBtnDisabled = true;

            if (!this.currentAccount) {
                this.submitLabel = 'Connect Wallet';
            } else if (fromInputValue && fromInputValue !== '0' && toInputValue && toInputValue !== '0') {
                if (parseFloat(fromInputValue) > this.maxFromInputValue) {
                    this.submitLabel = `Insufficient ${this.$defi.getTokenSymbol(this.fromToken)} balance`;
                } else if (parseFloat(toInputValue) > this.maxToInputValue) {
                    this.submitLabel = `Insufficient ${this.$defi.getTokenSymbol(this.toToken)} balance`;
                } else {
                    this.submitLabel = 'Supply';
                    this.submitBtnDisabled = false;
                }
            } else if (fromInputValue && fromInputValue !== '0') {
                this.submitLabel = 'Select a token';
            } else {
                this.submitLabel = 'Enter an amount';
            }
        },

        onFromMaxAmountClick() {
            const fromValue = Math.min(this.maxFromInputValue, this.fromTokenBalance);
            const toValue = this.convertFrom2To(fromValue);

            if (toValue > this.toTokenBalance) {
                this.toValue = this.toTokenBalance;

                defer(() => {
                    this.setToInputValue(this.toValue_);
                });
            } else {
                this.fromValue = fromValue;

                defer(() => {
                    this.setFromInputValue(this.fromValue_);
                });
            }
        },

        onToMaxAmountClick() {
            const toValue = Math.min(this.maxToInputValue, this.toTokenBalance);
            const fromValue = this.convertTo2From(toValue);

            if (fromValue > this.fromTokenBalance) {
                this.fromValue = this.fromTokenBalance;

                defer(() => {
                    this.setFromInputValue(this.fromValue_);
                });
            } else {
                this.toValue = toValue;

                defer(() => {
                    this.setToInputValue(this.toValue_);
                });
            }
        },

        onFromTokenSelectorClick() {
            this.$refs.pickFromTokenWindow.show();
        },

        onToTokenSelectorClick() {
            this.$refs.pickToTokenWindow.show();
        },

        /**
         * @param {DefiToken} _token Picked token.
         */
        onFromTokenPicked(_token) {
            if (_token.address === this.toToken.address) {
                this.swapTokens();
            } else {
                this.fromToken = _token;
                this.resetInputValues();
            }
        },

        /**
         * @param {DefiToken} _token Picked token.
         */
        onToTokenPicked(_token) {
            if (_token.address === this.fromToken.address) {
                this.swapTokens();
            } else {
                this.toToken = _token;

                // this.resetInputValues();
            }
        },

        /**
         * @param {InputEvent} _event
         */
        onFromInputChange(_event) {
            const cValue = this.correctFromInputValue(_event.target.value);
            const toValue = this.convertFrom2To(cValue);

            if (toValue > this.toTokenBalance) {
                this.toValue = this.toTokenBalance;
            } else {
                this.fromValue = cValue;

                defer(() => {
                    this.setFromInputValue(this.fromValue_);
                });
            }
        },

        /**
         * @param {InputEvent} _event
         */
        onToInputChange(_event) {
            const cValue = this.correctToInputValue(_event.target.value);
            const fromValue = this.convertTo2From(cValue);

            if (fromValue > this.fromTokenBalance) {
                this.fromValue = this.fromTokenBalance;
            } else {
                this.toValue = cValue;

                defer(() => {
                    this.setToInputValue(this.toValue_);
                });
            }
        },

        /**
         * Prevent typing '+' or '-'.
         * @param {KeyboardEvent} _event
         */
        onInputKeydown(_event) {
            if (_event.key === '+' || _event.key === '-') {
                _event.preventDefault();
            }
        },

        onSubmit() {
            const { fromToken } = this;
            const { toToken } = this;
            // const ftmTokens = ['FTM', 'WFTM'];
            const params = {
                fromValue: this.fromValue_,
                toValue: this.toValue_,
                fromToken: { ...fromToken },
                toToken: { ...toToken },
                slippageTolerance: this.slippageTolerance,
                steps: 3,
                step: 1,
                max: this.maxFromInputValue === this.fromValue,
            };

            if (!this.submitDisabled) {
                this.$router.push({
                    name: 'funiswap-add-liquidity-confirmation',
                    params,
                });
            }
        },

        onAccountPicked() {
            this.init();
            this.resetInputValues();
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
