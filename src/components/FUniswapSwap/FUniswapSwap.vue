<template>
    <div class="funiswap-swap funiswap">
        <f-card>
            <div class="funiswap__box">
                <div class="funiswap__token__balance">
                    <span>From</span>
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
                    <div class="funiswap__token__sign">-</div>
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
                    <button class="btn small secondary max-amount" @click="onMaxAmountClick">Max</button>
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
                <button class="btn round same-size light" title="Swap Tokens" @click="swapTokens">
                    <icon data="@/assets/svg/arrow-left.svg" width="12" height="12" dir="left" aria-hidden="true" />
                </button>
            </div>

            <div class="funiswap__box">
                <div class="funiswap__token__balance">
                    <span>To</span>
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
                    <div class="funiswap__token__sign">+</div>
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
                    <f-select-button
                        v-if="toToken.address"
                        collapsed
                        aria-label="pick a token"
                        class="bigger-arrow"
                        @click.native="onToTokenSelectorClick"
                    >
                        <f-crypto-symbol :token="toToken" img-width="24px" img-height="auto" />
                    </f-select-button>
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

            <div v-show="toToken.address" class="funiswap-swap__exchange-price">
                <div class="defi-label">Price</div>
                <div class="value">
                    <f-placeholder :content-loaded="!!perPrice" replacement-text="000.0000 fUSD per fETH">
                        {{ perPrice }}
                    </f-placeholder>
                </div>
                <div class="swap-price">
                    <button class="btn light same-size round" @click="swapPrice">
                        <icon data="@/assets/svg/exchange-alt.svg" />
                    </button>
                </div>
            </div>

            <div class="funiswap__submit-cont">
                <button ref="submitBut" class="btn large" :disabled="submitBtnDisabled" @click="onSubmit">
                    {{ submitLabel }}
                </button>
            </div>
        </f-card>

        <transition name="scale-center">
            <div v-if="showPriceInfo" class="funiswap__bottom-box">
                <div class="row no-vert-col-padding no-collapse">
                    <div class="col defi-label">
                        Minimum Received
                        <f-info window-closeable window-class="light" icon-size="16" class="uniswap-f-info">
                            Your transaction will revert if there is a large, unfavorable price movement before it is
                            confirmed.
                        </f-info>
                    </div>
                    <div class="col align-right"><f-token-value :value="minimumReceived" :token="toToken" /></div>
                </div>
                <div class="row no-vert-col-padding no-collapse">
                    <div class="col defi-label">
                        Liquidity Provider Fee
                        <f-info window-closeable window-class="light" icon-size="16" class="uniswap-f-info">
                            A portion of each trade ({{ liquidityProviderFee * 100 }}%) goes to liquidity providers as a
                            protocol incentive.
                        </f-info>
                    </div>
                    <div class="col align-right">
                        <f-token-value
                            :value="fromValue * liquidityProviderFee"
                            :token="fromToken"
                            :add-decimals="addDeciamals"
                        />
                    </div>
                </div>
            </div>
        </transition>

        <defi-token-picker-window
            ref="pickFromTokenWindow"
            :tokens="fromTokens"
            @defi-token-picked="onFromTokenPicked"
        />
        <defi-token-picker-window ref="pickToTokenWindow" :tokens="toTokens" @defi-token-picked="onToTokenPicked" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import FCryptoSymbol from '../../components/core/FCryptoSymbol/FCryptoSymbol.vue';
import FSelectButton from '../../components/core/FSelectButton/FSelectButton.vue';
import DefiTokenPickerWindow from '../../components/windows/DefiTokenPickerWindow/DefiTokenPickerWindow.vue';
import { defer, getUniqueId } from '../../utils';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
import FPlaceholder from '@/components/core/FPlaceholder/FPlaceholder.vue';
import FCard from '@/components/core/FCard/FCard.vue';
import FInfo from '@/components/core/FInfo/FInfo.vue';

export default {
    name: 'FUniswapSwap',

    components: {
        FInfo,
        FCard,
        FPlaceholder,
        FTokenValue,
        DefiTokenPickerWindow,
        FSelectButton,
        FCryptoSymbol,
    },

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
            perPrice: 0,
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

        fromInputValue() {
            return this.formatFromInputValue(this.fromValue);
        },

        fromTokens() {
            return this.getPickerTokens('from');
        },

        toTokens() {
            return this.getPickerTokens('to');
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

        maxFromInputValue() {
            /*
            if (this.fromToken.symbol === 'FUSD') {
                // subtract 0.5% fee
                max = this.fromTokenBalance - this.fromTokenBalance * 0.005;
            } else {
            */
            // }

            return this.fromTokenBalance;
        },

        maxToInputValue() {
            return this.convertFrom2To(this.maxFromInputValue);
            // return this.$defi.convertTokenValue(this.maxFromInputValue, this.fromToken, this.toToken);
        },

        submitDisabled() {
            return !this.currentAccount || this.correctFromInputValue(this.fromValue_) === 0;
        },

        minimumReceived() {
            return this.formatToInputValue(this.toValue * (1 - this.slippageTolerance));
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

                this.setPerPrice();

                this.setToInputValue(this.correctToInputValue(this.toValue_));

                /*
                this.updateInputColor(parseFloat(_value));
                this.updateSubmitLabel();

                this.setPerPrice();

                this._fromValueChanged = true;

                this.toValue = this.convertFrom2To(_value);

                defer(() => {
                    this.$refs.toInput.value = this.formatToInputValue(this.toValue);
                    this._fromValueChanged = false;
                });
*/
            }
        },

        toValue(_value, _oldValue) {
            if (_value !== _oldValue) {
                this.toValue_ = !_value ? 0 : parseFloat(_value);

                this.fromValue_ = this.convertTo2From(this.toValue_);

                this.updateInputColor(this.toValue_, true);
                this.updateInputColor(this.fromValue_);
                this.updateSubmitLabel();

                this.setPerPrice();

                this.setFromInputValue(this.correctFromInputValue(this.fromValue_));

                /*
                this.updateInputColor(parseFloat(_value), true);
                this.updateSubmitLabel();

                if (!this._fromValueChanged) {
                    // correct 'from' input value
                    // this.fromValue = this.correctFromInputValue(this.convertTo2From(_value));
                    this.setFromInputValue(this.correctFromInputValue(this.convertTo2From(_value)));
                }

                this._fromValueChanged = false;
*/
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

                    this.setToValue();
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

        this._fromValueChanged = false;

        if (!this.currentAccount) {
            this.submitLabel = 'Connect Wallet';
        }
    },

    mounted() {
        this.$refs.submitBut.disabled = true;
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

            this.setPerPrice();
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

        swapTokens() {
            const hToken = this.fromToken;
            const hValue = this.fromValue;

            this.fromToken = this.toToken;
            this.toToken = hToken;

            this.fromValue = this.toValue || '';
            this.toValue = hValue || '';

            this.fromValue = this.correctFromInputValue(this.fromValue) || '';

            this.setFromInputValue(this.fromValue);
            this.setToInputValue(this.toValue);

            this.setPerPrice();
        },

        /**
         * @param {number} _value
         */
        formatToInputValue(_value) {
            return _value !== 0 ? _value.toFixed(this.$defi.getTokenDecimals(this.toToken) + this.addDeciamals) : '';
        },

        /**
         * @param {number} _value
         */
        formatFromInputValue(_value) {
            return _value !== 0 ? _value.toFixed(this.$defi.getTokenDecimals(this.fromToken) + this.addDeciamals) : '';
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
            return Math.min(Math.max(_value, 0), this.maxToInputValue);
        },

        /**
         * @param {number} _value
         */
        convertFrom2To(_value) {
            const { fromToken } = this;
            const value = parseFloat(_value);

            return fromToken && fromToken._perPrice && !isNaN(value)
                ? value * this.$defi.fromTokenValue(fromToken._perPrice, fromToken)
                : 0;
        },

        /**
         * @param {number} _value
         */
        convertTo2From(_value) {
            const { toToken } = this;
            const value = parseFloat(_value);

            return toToken && toToken._perPrice && !isNaN(value)
                ? value * this.$defi.fromTokenValue(toToken._perPrice, toToken)
                : 0;
        },

        /*
        convertFrom2To(_value) {
            return this.$defi.convertTokenValue(_value, this.fromToken, this.toToken);
        },

        convertTo2From(_value) {
            return this.$defi.convertTokenValue(_value, this.toToken, this.fromToken);
        },
        */

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

        setFromInputValue(_value) {
            defer(() => {
                this.$refs.fromInput.value = this.formatFromInputValue(_value || 0);
            });
        },

        setToInputValue(_value) {
            defer(() => {
                this.$refs.toInput.value = this.formatToInputValue(_value || 0);
            });
        },

        setToValue() {
            const value = this.$refs.fromInput.value;

            if (value !== '') {
                this.toValue = this.convertFrom2To(value);
            }

            this.setToInputValue(this.toValue);

            this.updateSubmitLabel();
            this.setPerPrice();
        },

        async setTokenPrices() {
            const { dPair } = this;
            let price = dPair.pairAddress ? await this.$defi.getUniswapTokenPrice(this.fromToken.address, dPair) : '';

            if (price && price !== this.fromToken._perPrice) {
                this.fromToken = { ...this.fromToken, _perPrice: price };
            }

            price = dPair.pairAddress ? await this.$defi.getUniswapTokenPrice(this.toToken.address, dPair) : '';
            if (price && price !== this.toToken._perPrice) {
                this.toToken = { ...this.toToken, _perPrice: price };
            }

            this.setPerPrice();
        },

        setPerPrice() {
            const fromToken = this.perPriceDirF2T ? this.fromToken : this.toToken;
            const toToken = this.perPriceDirF2T ? this.toToken : this.fromToken;
            const perPrice = this.perPriceDirF2T ? this.convertTo2From(1) : this.convertFrom2To(1);
            const { $defi } = this;

            this.perPrice = `${perPrice.toFixed(4)} ${$defi.getTokenSymbol(fromToken)} per ${$defi.getTokenSymbol(
                toToken
            )}`;
            /*
            this.perPrice = `${perPrice.toFixed(
                this.$defi.getTokenDecimals(fromToken) + this.addDeciamals
            )} ${$defi.getTokenSymbol(fromToken)} per ${$defi.getTokenSymbol(toToken)}`;
            */
        },

        swapPrice() {
            this.perPriceDirF2T = !this.perPriceDirF2T;
            this.setPerPrice();
            this.setFromInputValue(this.fromValue);
            this.setToInputValue(this.toValue);
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
            const fromValue = this.fromValue_;
            const toValue = this.toValue_;

            this.submitBtnDisabled = true;

            if (!this.currentAccount) {
                this.submitLabel = 'Connect Wallet';
            } else if (fromValue && fromValue !== '0' && toValue && toValue !== '0') {
                if (parseFloat(fromValue) > this.maxFromInputValue || parseFloat(toValue) > this.maxToInputValue) {
                    this.submitLabel = `Insufficient ${this.$defi.getTokenSymbol(this.fromToken)} balance`;
                } else {
                    this.submitLabel = 'Swap';
                    this.submitBtnDisabled = false;
                }
            } else if (fromValue && fromValue !== '0') {
                this.submitLabel = 'Select a token';
            } else {
                this.submitLabel = 'Enter an amount';
            }

            // this.$refs.submitBut.innerText = submitLabel;
            // this.$refs.submitBut.disabled = submitBtnDisabled;

            this.showPriceInfo = !this.submitBtnDisabled;
        },

        onMaxAmountClick() {
            this.fromValue = this.maxFromInputValue;
            this.setFromInputValue(this.fromValue);
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
                steps: 2,
                step: 1,
                max: this.maxFromInputValue === this.fromValue,
            };

            if (!this.submitDisabled) {
                this.$router.push({
                    name: 'funiswap-swap-confirmation',
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
