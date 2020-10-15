<template>
    <span class="f-colored-number-range" :style="{ color: numberColor }">
        <slot :value="cValue" :percentage="percentage" :showPercentage="showPercentage">
            <template v-if="showPercentage"> {{ percentage }}% </template>
            <template v-else>
                {{ cValue }}
            </template>
        </slot>
    </span>
</template>

<script>
/**
 *
 */
export default {
    name: 'FColoredNumberRange',

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
        /** Show percentage rather than value. */
        showPercentage: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            numberColor: '',
        };
    },

    computed: {
        cValue() {
            let value = this.value;

            // Clamp value
            if (isNaN(value) || value < this.from) {
                value = this.from;
            } else if (value > this.to) {
                value = this.to;
            }

            this.setColor(value);

            return value;
        },

        percentage() {
            return Math.round(((this.cValue - this.from) / (this.to - this.from)) * 100);
        },
    },

    created() {
        if (this.to < this.from) {
            throw new Error("'to' must be bigger than 'from'");
        }
    },

    mounted() {
        this.setColor(this.cValue);
    },

    methods: {
        /**
         * Set circle stroke color according to current value and `this.colors` array.
         *
         * @param {number} _value
         */
        setColor(_value) {
            const { colors } = this;

            if (colors.length > 0) {
                let color = 'default';

                for (let i = colors.length - 1; i >= 0; i--) {
                    if (_value >= colors[i].value) {
                        color = colors[i].color;
                        break;
                    }
                }

                if (color !== 'default') {
                    this.numberColor = color;
                } else {
                    this.numberColor = '';
                }
            }
        },
    },
};
</script>
