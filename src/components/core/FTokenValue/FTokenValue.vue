<template>
    <span class="f-token-value">
        <f-placeholder v-if="usePlaceholder" :content-loaded="!!token.symbol" :replacement-text="replacementText">
            <span class="f-token-value__value">{{ tokenValue }}</span>
            <span v-if="!noCurrency" class="currency">{{ tokenSymbol }}</span>
        </f-placeholder>
        <template v-else>
            <span class="f-token-value__value">{{ tokenValue }}</span>
            <span v-if="!noCurrency" class="currency">{{ tokenSymbol }}</span>
        </template>
    </span>
</template>

<script>
import { formatNumberByLocale } from '@/filters.js';
import FPlaceholder from '@/components/core/FPlaceholder/FPlaceholder.vue';

export default {
    name: 'FTokenValue',
    components: { FPlaceholder },
    props: {
        /** @type {DefiToken} */
        token: {
            type: Object,
            default() {
                return {};
            },
            required: true,
        },
        /** Token's value. */
        value: {
            type: [Number, String],
            default: 0,
        },
        /** Hide currency. */
        noCurrency: {
            type: Boolean,
            default: false,
        },
        /** Use FPlaceholder. */
        usePlaceholder: {
            type: Boolean,
            default: true,
        },
        /** Replacement text for FPlaceholder. */
        replacementText: {
            type: String,
            default: '10,000.00 FTM',
        },
        /** Number of decimal places. If not set (-1), token decimal places will be taken. */
        decimals: {
            type: Number,
            default: -1,
        },
        /** Add this number of decimals to default token decimals. */
        addDecimals: {
            type: Number,
            default: 0,
        },
    },

    computed: {
        tokenSymbol() {
            return this.$defi.getTokenSymbol(this.token);
        },

        tokenValue() {
            return this.formatTokenValue(this.value);
        },
    },

    methods: {
        formatTokenValue(_value) {
            const decimals =
                this.decimals > -1 ? this.decimals : this.$defi.getTokenDecimals(this.token) + this.addDecimals;

            return _value === 0 ? 0 : formatNumberByLocale(parseFloat(_value).toFixed(decimals), decimals);
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
