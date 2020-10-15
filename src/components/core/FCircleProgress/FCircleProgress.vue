<template>
    <div class="f-circle-progress" :class="classes">
        <svg viewBox="-50 -50 100 100">
            <circle :r="r" cx="0" cy="0" fill="none" :stroke-width="strokeWidth" class="bg-circle" />
            <circle
                v-if="dashoffset < 1"
                ref="circle"
                :r="r"
                cx="0"
                cy="0"
                fill="none"
                :stroke-width="strokeWidth"
                stroke-dasharray="1"
                :stroke-dashoffset="dashoffset"
                transform="rotate(-90 0 0)"
                pathLength="1"
                class="circle"
            />
            <circle
                v-for="(dot, index) in dots"
                :key="`cpk_${dot.value}${index}`"
                :r="strokeWidth / 3"
                :cx="dotCx(index)"
                :cy="dotCy(index)"
                :fill="dot.color"
            />
            <text text-anchor="middle" dominant-baseline="central" class="text">
                <slot :value="cValue" :percentage="percentage" :showPercentage="showPercentage">
                    <slot name="value" :value="cValue" :percentage="percentage" :showPercentage="showPercentage">
                        <tspan>{{ showPercentage ? percentage : cValue }}</tspan>
                    </slot>
                    <tspan v-if="showPercentageSign" dominant-baseline="auto" class="text-percentage" dx="3">%</tspan>
                </slot>
            </text>
        </svg>
    </div>
</template>

<script>
/**
 *
 */
export default {
    name: 'FCircleProgress',

    props: {
        /** Current value. */
        value: {
            type: Number,
            default: 10,
        },
        /** Minimal value. */
        from: {
            type: Number,
            default: 0,
        },
        /** Maximal value. */
        to: {
            type: Number,
            default: 100,
        },
        /**
         * Colors of circle stroke by value.
         * If current value is bigger than value from array, color from array will be used.
         * @type {{color: string, value: number}[]}
         */
        colors: {
            type: Array,
            default() {
                return [];
            },
        },
        /**
         * Dots displayed on circle at positions given by values.
         * @type {{color: string, value: number}[]}
         */
        dots: {
            type: Array,
            default() {
                return [];
            },
        },
        /** Width of circle stroke. */
        strokeWidth: {
            type: Number,
            default: 5,
        },
        /** Animate progress circle. */
        animate: {
            type: Boolean,
            default: true,
        },
        /** Show percentage rather than value. */
        showPercentage: {
            type: Boolean,
            default: false,
        },
        /** Show percentage rather than value. */
        showPercentageSign: {
            type: Boolean,
            default: true,
        },
        /** Can exceed `to` value. */
        canExceed: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            r: 50 - this.strokeWidth / 2,
        };
    },

    computed: {
        cValue() {
            let value = this.value;

            // Clamp value
            if (isNaN(value) || value < this.from) {
                value = this.from;
            } else if (!this.canExceed && value > this.to) {
                value = this.to;
            }

            this.setCircleStrokeColor(value);

            return value;
        },

        percentage() {
            return this.getPercentage(this.cValue);
        },

        dashoffset() {
            const percentage = this.percentage > 100 ? 100 : this.percentage;

            return 1 - percentage / 100;
        },

        classes() {
            return {
                animate: this.animate,
            };
        },
    },

    created() {
        if (this.to < this.from) {
            throw new Error("'to' must be bigger than 'from'");
        }
    },

    mounted() {
        this.setCircleStrokeColor(this.cValue);
    },

    methods: {
        /**
         * @param {number} _index Index into `dots` array.
         */
        dotCx(_index) {
            return Math.cos(this.getDotX(_index)) * this.r;
        },

        /**
         * @param {number} _index Index into `dots` array.
         */
        dotCy(_index) {
            return Math.sin(this.getDotX(_index)) * this.r;
        },

        /**
         * @param {number} _index Index into `dots` array.
         */
        getDotX(_index) {
            const PI = Math.PI;
            let percentage = this.getPercentage(this.dots[_index].value);

            if (percentage > 100) {
                percentage = 100;
            }

            return 2 * PI * (percentage / 100) - PI / 2;
        },

        /**
         * @param {number} _value
         */
        getPercentage(_value) {
            return Math.round(((_value - this.from) / (this.to - this.from)) * 100);
        },

        /**
         * Set circle stroke color according to current value and `this.colors` array.
         *
         * @param {number} _value
         */
        setCircleStrokeColor(_value) {
            const { colors } = this;

            if (colors.length > 0 && this.$el) {
                let color = 'default';

                for (let i = colors.length - 1; i >= 0; i--) {
                    if (_value >= colors[i].value) {
                        color = colors[i].color;
                        break;
                    }
                }

                if (color !== 'default') {
                    this.$el.style.setProperty('--f-circle-progress-circle-color', color);
                } else {
                    this.$el.style.setProperty('--f-circle-progress-circle-color', '');
                }
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
