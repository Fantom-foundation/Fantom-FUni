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
                    <div class="col available-balance">{{ getAvailableBalance(token) }}</div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import { cloneObject } from '@/utils';
import { isAriaAction } from '@/utils/aria.js';
import FCryptoSymbol from '../core/FCryptoSymbol/FCryptoSymbol.vue';
import { mapGetters } from 'vuex';

export default {
    name: 'Erc20TokenList',

    components: { FCryptoSymbol },

    props: {
        /** @type {ERC20Token[]} */
        tokens: {
            type: Array,
            default() {
                return [];
            },
        },
    },

    data() {
        return {
            dTokens: [],
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),
    },

    created() {
        this._isDestroyed = false;
    },

    mounted() {
        this.setDTokens(this.tokens);
    },

    beforeDestroy() {
        this._isDestroyed = true;
    },

    methods: {
        /**
         * @param {ERC20Token[]} _tokens
         */
        async setDTokens(_tokens) {
            const { currentAccount } = this;

            if (_tokens && _tokens.length > 0) {
                this.dTokens = _tokens;

                if (currentAccount) {
                    const tokens = cloneObject(_tokens);
                    const { $defi } = this;

                    for (let i = 0, len1 = tokens.length; i < len1; i++) {
                        tokens[i].balanceOf = await $defi.fetchERC20TokenAvailableBalance(
                            currentAccount.address,
                            tokens[i].address
                        );

                        if (this._isDestroyed) {
                            break;
                        }
                    }

                    this.dTokens = tokens;
                }
            }
        },

        /**
         * @param {ERC20Token} _token
         * @return {number}
         */
        getAvailableBalance(_token) {
            const balance = this.$defi.fromTokenValue(_token.balanceOf, _token) || 0;

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
                this.$emit('erc20-token-picked', cloneObject(token));
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
