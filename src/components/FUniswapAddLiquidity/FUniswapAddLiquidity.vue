<template>
    <div class="funiswap-add-liquidity funiswap">
        <h1 class="with-back-btn">
            <f-back-button :route-name="backButtonRoute" />
            Add Liquidity
        </h1>
        <br />

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
                            :add-decimals="addDecimals"
                            no-currency
                        />
                    </span>
                </div>
                <div class="funiswap__token__body">
                    <span>
                        <input
                            :id="`text-input-${id}`"
                            ref="fromInput"
                            v-model="fromValue"
                            type="text"
                            inputmode="decimal"
                            autocomplete="off"
                            placeholder="0"
                            class="text-input no-style"
                            @keydown="onInputKeydown"
                        />
                    </span>
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
                            :add-decimals="addDecimals"
                            no-currency
                        />
                    </span>
                </div>
                <div class="funiswap__token__body">
                    <span>
                        <input
                            :id="`text-input-${id}-2`"
                            ref="toInput"
                            v-model="toValue"
                            type="text"
                            inputmode="decimal"
                            autocomplete="off"
                            placeholder="0"
                            class="text-input no-style"
                            @keydown="onInputKeydown"
                        />
                    </span>
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
            <template v-if="!dPair.pairAddress">
                By adding liquidity you'll earn 0.3% of all trades on this pair proportional to your share of the pool.
                Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
            </template>
            <f-uniswap-pair-liquidity-info v-else :pair="dPair" :from-token="fromToken" :to-token="toToken" />
        </div>

        <erc20-token-picker-window
            ref="pickFromTokenWindow"
            :tokens="tokenPickerTokens"
            @erc20-token-picked="onFromTokenPicked"
        />
        <erc20-token-picker-window
            ref="pickToTokenWindow"
            :tokens="tokenPickerTokens"
            @erc20-token-picked="onToTokenPicked"
        />
    </div>
</template>

<script>
import FCard from '@/components/core/FCard/FCard.vue';
import { cloneObject, defer, getUniqueId } from '@/utils';
import { mapGetters } from 'vuex';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
import FSelectButton from '@/components/core/FSelectButton/FSelectButton.vue';
import FCryptoSymbol from '@/components/core/FCryptoSymbol/FCryptoSymbol.vue';
import FUniswapPairLiquidityInfo from '@/components/FUniswapPairLiquidityInfo/FUniswapPairLiquidityInfo.vue';
import FBackButton from '@/components/core/FBackButton/FBackButton.vue';
import { pollingMixin } from '@/mixins/polling.js';
import Erc20TokenPickerWindow from '@/components/windows/Erc20TokenPickerWindow/Erc20TokenPickerWindow.vue';
import { TokenPairs } from '@/utils/token-pairs.js';
import { getAppParentNode } from '@/app-structure.js';
import appConfig from '../../../app.config.js';

export default {
    name: 'FUniswapAddLiquidity',

    components: {
        FBackButton,
        Erc20TokenPickerWindow,
        FUniswapPairLiquidityInfo,
        FCryptoSymbol,
        FSelectButton,
        FTokenValue,
        FCard,
    },

    mixins: [pollingMixin],

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
            /** @type {ERC20Token} */
            fromToken: {},
            /** @type {ERC20Token} */
            toToken: {},
            sliderLabels: ['0%', '25%', '50%', '75%', '100%'],
            id: getUniqueId(),
            liquidityProviderFee: appConfig.settings.fUniswapLiquidityProviderFee,
            submitLabel: 'Select a token',
            /** @type {UniswapPair} */
            dPair: {},
            /** @type {UniswapPair[]} */
            pairs: [],
            tokenPickerTokens: [],
            addDecimals: 0,
        };
    },

    computed: {
        ...mapGetters(['currentAccount', 'fUniswapSlippageTolerance']),

        /**
         * @return {{fromToken: ERC20Token, toToken: ERC20Token}}
         */
        params() {
            const { $route } = this;

            return $route && $route.params ? $route.params : {};
        },

        fromTokenBalance() {
            const { fromToken } = this;
            let balance = this.$defi.fromTokenValue(fromToken.balanceOf, fromToken);

            if (balance < 0) {
                balance = 0;
            }

            return balance;
        },

        toTokenBalance() {
            const { toToken } = this;

            return this.$defi.fromTokenValue(toToken.balanceOf, toToken);
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
            const pairToken = TokenPairs.findToken(dPair.tokens, this.fromToken);
            let share = 0;

            if (dPair.pairAddress) {
                share = dPair.shareOf ? parseInt(dPair.shareOf, 16) / parseInt(dPair.totalSupply, 16) : 0;

                if (pairToken && this.fromValue_ > 0) {
                    share += this.fromValue_ / this.$defi.fromTokenValue(pairToken.balanceOf, this.fromToken);
                }

                return !isNaN(share) ? `${(share * 100).toFixed(3)}%` : '-';
            }

            return '-';
        },

        backButtonRoute() {
            const parentNode = getAppParentNode('funiswap-add-liquidity');

            return parentNode ? parentNode.route : '';
        },

        sufficientPairLiquidity() {
            const { dPair } = this;

            return dPair && dPair.pairAddress && dPair.totalSupply !== '0x0';
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

                this.setToInputValue(this.toValue_);
                // this.setToInputValue(this.correctToInputValue(this.toValue_));
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

                this.setFromInputValue(this.fromValue_);
                // this.setFromInputValue(this.correctFromInputValue(this.fromValue_));
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

                    // pair not exists
                    if (!this.dPair.pairAddress) {
                        this.toToken = {};
                    }

                    defer(() => {
                        this.updateSubmitLabel();
                    });

                    this.setRouteParams();
                }

                if (!_value._loadingBalance) {
                    this.setTokenBalance(_value, 'from');
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

                    this.setRouteParams();
                }

                if (!_value._loadingBalance) {
                    this.setTokenBalance(_value, 'to');
                }
            }
        },

        currentAccount(_value, _oldValue) {
            if (!_oldValue || !_value || _value.address !== _oldValue.address) {
                this.onAccountPicked();
            }
        },

        $route() {
            this.setTokensByRouteParams();
        },
    },

    created() {
        this.init();

        if (!this.currentAccount) {
            this.submitLabel = 'Connect Wallet';
        }

        this._polling.start(
            'update-funiswap-add-liquidity-prices',
            () => {
                this.setTokenPrices();
            },
            4000
        );
    },

    methods: {
        /**
         * @param {boolean} [_accountPicked]
         */
        async init(_accountPicked) {
            const { $defi } = this;
            const { params } = this;
            const result = await Promise.all([$defi.fetchUniswapPairs(), $defi.init()]);

            this.pairs = result[0];

            if (params.tokena && params.tokenb) {
                this.setTokensByRouteParams(_accountPicked);
            } else {
                this.fromToken = this.getInitialToken();
            }

            this.setPrices();
        },

        /**
         * @return {ERC20Token|{}}
         */
        getInitialToken() {
            const { params } = this;
            let fromToken = {};

            if (this.pairs.length > 0) {
                const pairs = params.tokena ? TokenPairs.getTokenPairs(this.pairs, params.tokena) : this.pairs;

                if (pairs.length > 0) {
                    if (params.tokena) {
                        fromToken = TokenPairs.findToken(pairs[0].tokens, params.tokena);
                    } else {
                        fromToken = TokenPairs.findTokenBySymbol(pairs[0].tokens, 'WFTM') || pairs[0].tokens[0];
                    }
                }
            }

            return fromToken;
        },

        async getUniswapPair() {
            const address = this.currentAccount ? this.currentAccount.address : '';
            let pair = TokenPairs.getPairByTokens(this.pairs, [this.fromToken, this.toToken]) || {};

            if (pair.pairAddress) {
                pair = await this.$defi.fetchUniswapPairs(address, pair.pairAddress, [
                    this.fromToken.address,
                    this.toToken.address,
                ]);
            }

            return pair;
        },

        /**
         * @param {ERC20Token} _token
         * @param {('from'|'to')} [_tokenType]
         */
        async setTokenBalance(_token, _tokenType = 'from') {
            const address = this.currentAccount ? this.currentAccount.address : '';

            _token._loadingBalance = true;

            if (address && _token.address) {
                _token.balanceOf = await this.$defi.fetchERC20TokenAvailableBalance(address, _token.address);
            }

            if (_tokenType === 'from') {
                this.fromToken = cloneObject(_token);
            } else {
                this.toToken = cloneObject(_token);
            }

            _token._loadingBalance = false;
        },

        /**
         * Get token list for `erc20-token-picker-window`.
         *
         * @param {('from'|'to')} [_tokenType]
         * @return {ERC20Token[]}
         */
        getTokenPickerTokens(_tokenType = 'from') {
            let tokens = [];
            let token = _tokenType === 'from' ? this.fromToken : this.toToken;
            let currToken = null;
            const bothPicked = !!this.fromToken.address && !!this.toToken.address;

            if (token.address && !(bothPicked && token !== this.fromToken)) {
                tokens = cloneObject(TokenPairs.getTokensFromPairs(TokenPairs.getTokenPairs(this.pairs, token)));

                currToken = TokenPairs.findToken(tokens, token);
            } else {
                tokens = cloneObject(TokenPairs.getTokensFromPairs(this.pairs));

                currToken = TokenPairs.findToken(tokens, _tokenType === 'from' ? this.toToken : this.fromToken);
            }

            // disable current token in list
            if (currToken) {
                currToken.disabled = true;
            }

            return tokens;
        },

        /*        async getUniswapPair() {
            const addressA = this.fromToken.address;
            const addressB = this.toToken.address;

            if (addressA && addressB) {
                const address = this.currentAccount ? this.currentAccount.address : '';
                let uniswapPairs = await this.$defi.fetchUniswapPairs(address, '', [addressA, addressB]);

                if (uniswapPairs.pairAddress) {
                    uniswapPairs = await this.$defi.fetchUniswapPairs(address, uniswapPairs.pairAddress, [
                        addressA,
                        addressB,
                    ]);
                }

                return uniswapPairs;
            }

            return {};
        },*/

        setRouteParams() {
            const { fromToken } = this;
            const { toToken } = this;
            const { $route } = this;

            if (
                fromToken.address &&
                toToken.address &&
                ($route.params.tokena !== fromToken.address || $route.params.tokenb !== toToken.address)
            ) {
                this.$router.push({
                    name: $route.name,
                    params: {
                        tokena: fromToken.address,
                        tokenb: toToken.address,
                    },
                });
            }
        },

        /**
         * @param {boolean} [_accountPicked]
         */
        setTokensByRouteParams(_accountPicked) {
            const { params } = this.$route;

            if (params.tokena && params.tokenb) {
                if (
                    _accountPicked ||
                    params.tokena !== this.fromToken.address ||
                    params.tokenb !== this.toToken.address
                ) {
                    const pair = TokenPairs.getPairByTokens(this.pairs, [
                        { address: params.tokena },
                        { address: params.tokenb },
                    ]);

                    if (pair.pairAddress) {
                        this.fromToken = TokenPairs.findPairToken(pair, { address: params.tokena });
                        this.toToken = TokenPairs.findPairToken(pair, { address: params.tokenb });
                    } else {
                        this.toToken = {};
                        this.fromToken = this.getInitialToken();
                    }

                    this.setTokenPrices();
                    this.resetInputValues();
                }
            } else {
                this.toToken = {};
                this.fromToken = this.getInitialToken();
            }
        },

        resetInputValues() {
            const { $refs } = this;

            this.fromValue_ = 0;
            this.fromValue = '';
            if ($refs.fromInput) {
                $refs.fromInput.value = '';
            }

            this.toValue_ = 0;
            this.toValue = '';
            if ($refs.toInput) {
                $refs.toInput.value = '';
            }
            /*
            this.fromValue = '';
            this.toValue = '';
            */
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

            return value !== 0 ? value.toFixed(this.$defi.getTokenDecimals(this.toToken) + this.addDecimals) : '';
        },

        /**
         * @param {number} _value
         */
        formatFromInputValue(_value) {
            const value = parseFloat(_value);

            return value !== 0 ? value.toFixed(this.$defi.getTokenDecimals(this.fromToken) + this.addDecimals) : '';
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
                if (fromTokenTotal > 0) {
                    price = toTokenTotal / fromTokenTotal;
                }

                if (price !== fromToken._perPrice) {
                    this.fromToken = { ...fromToken, _perPrice: price };
                }
            }

            if (toToken.address) {
                if (toTokenTotal > 0) {
                    price = fromTokenTotal / toTokenTotal;
                }

                if (price !== toToken._perPrice) {
                    this.toToken = { ...toToken, _perPrice: price };
                }
            }

            this.setPrices();
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

        updateInputColor() {},

        /*
        updateInputColor(_value, _toInput = false) {
            const cValue = _toInput ? this.correctToInputValue(_value) : this.correctFromInputValue(_value);
            const eInput = _toInput ? this.$refs.toInput : this.$refs.fromInput;

            if (_value > cValue) {
                eInput.classList.add('invalid');
            } else {
                eInput.classList.remove('invalid');
            }
        },
        */

        updateSubmitLabel() {
            // const fromInputValue = this.$refs.fromInput.value;
            // const toInputValue = this.$refs.toInput.value;
            const fromInputValue = this.fromValue_;
            const toInputValue = this.toValue_;

            this.submitBtnDisabled = true;

            if (!this.currentAccount) {
                this.submitLabel = 'Connect Wallet';
                // } else if (fromInputValue && fromInputValue !== '0' && toInputValue && toInputValue !== '0') {
            } else if (!this.toToken.address) {
                this.submitLabel = 'Select a token';
            } else if (this.fromTokenBalance === 0 && this.toTokenBalance === 0) {
                this.submitLabel = 'Insufficient  Balance';
            } else if (this.fromTokenBalance === 0) {
                this.submitLabel = `Insufficient ${this.$defi.getTokenSymbol(this.fromToken)} balance`;
            } else if (this.toTokenBalance === 0) {
                this.submitLabel = `Insufficient ${this.$defi.getTokenSymbol(this.toToken)} balance`;
            } else if (fromInputValue || toInputValue) {
                if (fromInputValue > this.maxFromInputValue || (fromInputValue === 0 && this.maxFromInputValue === 0)) {
                    this.submitLabel = `Insufficient ${this.$defi.getTokenSymbol(this.fromToken)} balance`;
                } else if (toInputValue > this.maxToInputValue || (toInputValue === 0 && this.maxToInputValue === 0)) {
                    this.submitLabel = `Insufficient ${this.$defi.getTokenSymbol(this.toToken)} balance`;
                } else {
                    this.submitLabel = 'Supply';
                    this.submitBtnDisabled = false;
                }
            } else if (this.sufficientPairLiquidity === false) {
                this.submitLabel = 'Insufficient Pair Liquidity';
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
            this.tokenPickerTokens = this.getTokenPickerTokens('to');
            this.$refs.pickFromTokenWindow.show();
        },

        onToTokenSelectorClick() {
            this.tokenPickerTokens = this.getTokenPickerTokens('from');
            this.$refs.pickToTokenWindow.show();
        },

        /**
         * @param {ERC20Token} _token Picked token.
         */
        onFromTokenPicked(_token) {
            if (_token.address === this.toToken.address) {
                this.swapTokens();
            } else {
                this.fromToken = _token;
                this.resetInputValues();
                this.updateSubmitLabel();
            }
        },

        /**
         * @param {ERC20Token} _token Picked token.
         */
        onToTokenPicked(_token) {
            if (_token.address === this.fromToken.address) {
                this.swapTokens();
            } else {
                this.toToken = _token;
                this.resetInputValues();
                this.updateSubmitLabel();
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
                slippageTolerance: this.fUniswapSlippageTolerance,
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
            this.init(true);
            this.resetInputValues();
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
