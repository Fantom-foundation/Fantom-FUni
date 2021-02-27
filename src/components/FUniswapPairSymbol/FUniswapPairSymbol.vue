<template>
    <div class="f-uniswap-pair-symbol">
        <template v-if="!noSymbols">
            <f-crypto-symbol
                :token="tokens[0]"
                :img-width="imgWidth"
                :img-height="imgHeight"
                no-symbol
                class="first-symbol"
            />
            <f-crypto-symbol :token="tokens[1]" :img-width="imgWidth" :img-height="imgHeight" no-symbol />
        </template>

        <router-link v-if="routerLinkTo.name" :to="routerLinkTo">
            {{ $defi.getTokenSymbol(tokens[0]) }}-{{ $defi.getTokenSymbol(tokens[1]) }}
        </router-link>
        <template v-else> {{ $defi.getTokenSymbol(tokens[0]) }}-{{ $defi.getTokenSymbol(tokens[1]) }} </template>
    </div>
</template>

<script>
import FCryptoSymbol from '@/components/core/FCryptoSymbol/FCryptoSymbol.vue';

/**
 * Renders uniswap pair.
 * Requires vue defi plugin ($defi) and FCryptoSymbol.
 */
export default {
    name: 'FUniswapPairSymbol',
    components: { FCryptoSymbol },
    props: {
        /** @type {UniswapPair} */
        pair: {
            type: Object,
            default() {
                return {};
            },
            required: true,
        },
        /** Hide symbols */
        noSymbols: {
            type: Boolean,
            default: false,
        },
        imgWidth: {
            type: String,
            default: '32px',
        },
        imgHeight: {
            type: String,
            default: '32px',
        },
        routerLinkTo: {
            type: Object,
            default() {
                return {};
            },
        },
    },

    data() {
        return {
            logoUrl: this.token ? this.token.logoUrl : '',
        };
    },

    computed: {
        tokens() {
            const { pair } = this;

            return pair && pair.tokens ? pair.tokens : [];
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
