<template>
    <div class="defi-token-list">
        <f-listbox ref="listbox" :data="dTokens" @item-selected="onListboxItemSelected">
            <template v-slot="{ item }">
                <div class="row align-items-center no-collapse">
                    <div class="col"><f-crypto-symbol :token="item" img-width="40px" img-height="40px" /></div>
                    <div class="col available-balance">{{ getAvailableBalance(item) }}</div>
                </div>
            </template>
        </f-listbox>
    </div>
</template>

<script>
import { cloneObject, defer } from '@/utils';
import FCryptoSymbol from '../core/FCryptoSymbol/FCryptoSymbol.vue';
import { mapGetters } from 'vuex';
import FListbox from '@/components/core/FListbox/FListbox.vue';

export default {
    name: 'Erc20TokenList',

    components: { FListbox, FCryptoSymbol },

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

        defer(() => {
            this.$refs.listbox.$el.focus();
        });
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
         * @param {ERC20Token} _token
         */
        onListboxItemSelected(_token) {
            if (_token) {
                this.$emit('erc20-token-picked', cloneObject(_token));
            }
        },
    },
};
</script>

<style lang="scss">
@import '../DefiTokenList/style';
</style>
