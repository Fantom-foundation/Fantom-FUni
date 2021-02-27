<template>
    <span class="fpricediff" :class="classes">
        <span class="fpricediff_sign">{{ sign }}</span
        >{{ diffFormated }}%
    </span>
</template>

<script>
/**
 * Shows price difference in percentage.
 */
export default {
    name: 'FPriceDiff',

    props: {
        /** Current value */
        currValue: {
            type: [Number, String],
            default: 0,
            required: true,
        },
        /** Previous value */
        prevValue: {
            type: [Number, String],
            default: 0,
            required: true,
        },
        /** Decimal places of the result */
        decimals: {
            type: Number,
            default: 2,
        },
    },

    computed: {
        diff() {
            const currValue = parseFloat(this.currValue);
            const prevValue = parseFloat(this.prevValue);
            const diff = prevValue !== 0 ? ((currValue - prevValue) / prevValue) * 100 : 0;

            return this.decimals > 0 ? diff.toFixed(this.decimals) : diff;
        },

        diffFormated() {
            const diff = Math.abs(this.diff);

            return this.decimals > 0 ? diff.toFixed(this.decimals) : diff;
        },

        sign() {
            return this.diff < 0 ? '-' : '+';
        },

        classes() {
            return {
                'fpricediff-green': this.diff > 0,
                'fpricediff-red': this.diff < 0,
            };
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
