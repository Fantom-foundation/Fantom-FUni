<template>
    <div class="defi-token-list">
        <ul class="no-markers" @click="onTokenListClick" @keyup="onTokenListKeyup">
            <li
                v-for="token in dTokens"
                :key="token.address"
                :data-token-address="!token._disabled ? token.address : ''"
                :tabindex="token._disabled ? -1 : 0"
                :class="{ disabled: token._disabled }"
            >
                <div class="row align-items-center no-collapse">
                    <div class="col"><f-crypto-symbol :token="token" img-width="40px" img-height="40px" /></div>
                    <div v-if="!hideBalance" class="col available-balance">{{ getAvailableBalance(token) }}</div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import { cloneObject } from '../../utils';
import { isAriaAction } from '../../utils/aria.js';
import FCryptoSymbol from '../core/FCryptoSymbol/FCryptoSymbol.vue';

export default {
    name: 'DefiTokenList',

    components: { FCryptoSymbol },

    props: {
        /** @type {DefiToken[]} */
        tokens: {
            type: Array,
            default() {
                return [];
            },
        },
        hideBalance: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            dTokens: [],
        };
    },

    watch: {
        tokens(_value) {
            this.setDTokens(_value);
        },
    },

    created() {
        this.setDTokens(this.tokens);
    },

    methods: {
        /**
         * @param {DefiToken[]} _tokens
         */
        setDTokens(_tokens) {
            if (_tokens && _tokens.length > 0) {
                // accept only active tokens
                this.dTokens = _tokens.filter((_item) => _item.isActive);
            }
        },

        /**
         * @param {DefiToken} _token
         * @return {number}
         */
        getAvailableBalance(_token) {
            const balance = this.$defi.fromTokenValue(_token.availableBalance, _token) || 0;

            return balance > 0 ? balance.toFixed(this.$defi.getTokenDecimals(_token)) : 0;
        },

        /**
         * @param {Event} _event
         */
        onTokenListClick(_event) {
            const elem = _event.target.closest('[data-token-address]');
            const address = elem ? elem.getAttribute('data-token-address') : '';
            const token = address ? this.dTokens.find((_item) => _item.address === address) : null;

            if (token) {
                this.$emit('defi-token-picked', cloneObject(token));
            }
        },

        /**
         * @param {KeyboardEvent} _event
         */
        onTokenListKeyup(_event) {
            if (isAriaAction(_event)) {
                this.onTokenListClick(_event);
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
