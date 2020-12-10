<template>
    <div class="funiswap-wrap-ftm funiswap">
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
                            :add-decimals="addDecimals"
                            no-currency
                        />
                    </span>
                </div>
                <div class="funiswap__token__body">
                    <div class="funiswap__token__sign">-</div>
                    <span>
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
                    </span>
                    <button class="btn small secondary max-amount" @click="onMaxAmountClick">Max</button>
                    <f-crypto-symbol :token="fromToken" img-width="24px" img-height="auto" />
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
                            :add-decimals="addDecimals"
                            no-currency
                        />
                    </span>
                </div>
                <div class="funiswap__token__body">
                    <div class="funiswap__token__sign">+</div>
                    <span>
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
                    </span>
                    <f-crypto-symbol :token="toToken" img-width="24px" img-height="auto" />
                </div>
            </div>

            <div v-show="toToken.address" class="funiswap-wrap-ftm__exchange-price">
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
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import FCryptoSymbol from '../../components/core/FCryptoSymbol/FCryptoSymbol.vue';
import { defer, getUniqueId } from '../../utils';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
import FPlaceholder from '@/components/core/FPlaceholder/FPlaceholder.vue';
import FCard from '@/components/core/FCard/FCard.vue';

export default {
    name: 'FUniswapWrapFTM',

    components: {
        FCard,
        FPlaceholder,
        FTokenValue,
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
            perPrice: 0,
            /** Per price direction. true - from -> to, false - to -> from */
            perPriceDirF2T: true,
            submitBtnDisabled: true,
            /** @type {DefiToken} */
            fromToken: {},
            /** @type {DefiToken} */
            toToken: {},
            /** @type {DefiToken[]} */
            tokens: [],
            sliderLabels: ['0%', '25%', '50%', '75%', '100%'],
            id: getUniqueId(),
            submitLabel: 'Enter an amount',
            dPair: {},
            addDecimals: 2,
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

        fromTokenBalance() {
            const { fromToken } = this;
            let balance = this.$defi.fromTokenValue(fromToken.availableBalance, fromToken);

            if (balance < 0) {
                balance = 0;
            }

            return balance;
        },

        toTokenBalance() {
            return this.$defi.fromTokenValue(this.toToken.availableBalance, this.toToken);
        },

        maxFromInputValue() {
            let max = this.fromTokenBalance;

            if (this.fromToken.symbol === 'FTM') {
                max -= 2;
            }

            if (max < 0) {
                max = 0;
            }

            /*
            if (this.fromToken.symbol === 'FUSD') {
                // subtract 0.5% fee
                max = this.fromTokenBalance - this.fromTokenBalance * 0.005;
            } else {
            */
            // }

            return max;
        },

        maxToInputValue() {
            return this.convertFrom2To(this.maxFromInputValue);
            // return this.$defi.convertTokenValue(this.maxFromInputValue, this.fromToken, this.toToken);
        },

        submitDisabled() {
            return !this.currentAccount || this.correctFromInputValue(this.fromValue) === 0;
        },
    },

    watch: {
        fromValue(_value, _oldValue) {
            if (_value !== _oldValue) {
                this.updateInputColor(parseFloat(_value));
                this.updateSubmitLabel();

                this.setPerPrice();

                this._fromValueChanged = true;

                this.toValue = this.convertFrom2To(_value);

                defer(() => {
                    this.$refs.toInput.value = this.formatToInputValue(this.toValue);
                    this._fromValueChanged = false;
                });
            }
        },

        toValue(_value, _oldValue) {
            if (_value !== _oldValue) {
                this.updateInputColor(parseFloat(_value), true);
                this.updateSubmitLabel();

                if (!this._fromValueChanged) {
                    // correct 'from' input value
                    // this.fromValue = this.correctFromInputValue(this.convertTo2From(_value));
                    this.setFromInputValue(this.correctFromInputValue(this.convertTo2From(_value)));
                }

                this._fromValueChanged = false;
            }
        },

        currentAccount(_value, _oldValue) {
            if (!_oldValue || !_value || _value.address !== _oldValue.address) {
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
            const address = this.currentAccount ? this.currentAccount.address : '';
            const result = await Promise.all([$defi.fetchTokens(address), $defi.init()]);

            this.tokens = result[0];

            const wFTM = this.tokens.find((_item) => _item.symbol === 'WFTM');

            const account = address ? await this.$fWallet.getBalance(address, false, true) : { balance: '0x0' };
            const ftmToken = {
                address: '0xfc00face00000000000000000000000000000000',
                symbol: 'FTM',
                name: 'Fantom',
                isActive: true,
                decimals: 18,
                price: wFTM.price,
                priceDecimals: wFTM.priceDecimals,
                availableBalance: account.balance,
                allowance: '0x0',
                logoUrl: 'https://cryptologos.cc/logos/fantom-ftm-logo.svg?v=003',
            };
            $defi._setTokenDecimals(ftmToken);

            this.fromToken = ftmToken;
            this.toToken = wFTM;

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
            return _value !== 0 ? _value.toFixed(this.$defi.getTokenDecimals(this.toToken) + this.addDecimals) : '';
        },

        /**
         * @param {number} _value
         */
        formatFromInputValue(_value) {
            return _value !== 0 ? _value.toFixed(this.$defi.getTokenDecimals(this.fromToken) + this.addDecimals) : '';
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

        convertFrom2To(_value) {
            return this.$defi.convertTokenValue(_value, this.fromToken, this.toToken);
        },

        convertTo2From(_value) {
            return this.$defi.convertTokenValue(_value, this.toToken, this.fromToken);
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
                this.$defi.getTokenDecimals(fromToken) + this.addDecimals
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
            const { fromValue } = this;
            const { toValue } = this;

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
        },

        onMaxAmountClick() {
            this.fromValue = this.maxFromInputValue;
            this.setFromInputValue(this.fromValue);
        },

        /**
         * @param {InputEvent} _event
         */
        onFromInputChange(_event) {
            const cValue = this.correctFromInputValue(_event.target.value);

            if (this.fromValue === cValue) {
                this.$nextTick(() => {
                    this.$refs.fromInput.value = this.formatFromInputValue(cValue);
                });
            }

            this.fromValue = cValue;

            this.updateInputColor(this.fromValue);
        },

        /**
         * @param {InputEvent} _event
         */
        onToInputChange(_event) {
            const cValue = this.correctToInputValue(_event.target.value);

            if (this.toValue === cValue) {
                this.$nextTick(() => {
                    this.$refs.toInput.value = this.formatToInputValue(cValue);
                });
            }

            this.toValue = cValue;
            // this.fromValue = this.convertTo2From(this.toValue);

            this.updateInputColor(this.toValue, true);
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
                fromValue: this.fromValue,
                toValue: this.toValue,
                fromToken: { ...fromToken },
                toToken: { ...toToken },
                slippageTolerance: this.slippageTolerance,
                max: this.maxFromInputValue === this.fromValue,
            };

            if (!this.submitDisabled) {
                this.$router.push({
                    name: 'funiswap-wrap-ftm-confirmation',
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
