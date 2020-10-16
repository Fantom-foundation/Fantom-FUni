<template>
    <div class="settings">
        <f-form ref="form" center-form @f-form-change="onFormChange">
            <fieldset>
                <legend class="not-visible">Settings form</legend>
                <div class="form-body">
                    <f-input
                        name="slippage_tolerance"
                        :value="$store.state.fUniswapSlippageTolerance.toString()"
                        label="Slippage Tolerance"
                        type="number"
                        min="0.1"
                        max="100"
                        step="0.1"
                        field-size="large"
                        validate-on-input
                        :validator="checkSlippageTolerance"
                    >
                        <template #top="sProps">
                            <div class="input-label-layout">
                                <label :for="sProps.inputId">{{ sProps.label }}</label>
                                <f-info window-closeable window-class="light" style="margin-left: 8px">
                                    Your transaction in fUniswap will revert if the price changes unfavorable by more
                                    than this percentage.
                                </f-info>
                            </div>
                        </template>
                        <template #bottom="sProps">
                            <f-message v-show="sProps.showErrorMessage" type="error" role="alert" with-icon>
                                Value must be between 0.1% and 100%
                            </f-message>
                        </template>
                        <template #suffix>%</template>
                    </f-input>

                    <br />
                    <f-toggle-button name="night_mode" label="Dark Mode" :checked="darkModeOn" />
                </div>
            </fieldset>
        </f-form>
    </div>
</template>

<script>
import FForm from '@/components/core/FForm/FForm.vue';
import FInput from '@/components/core/FInput/FInput.vue';
import FInfo from '@/components/core/FInfo/FInfo.vue';
import FMessage from '@/components/core/FMessage/FMessage.vue';
import FToggleButton from '@/components/core/FToggleButton/FToggleButton.vue';

export default {
    name: 'Settings',

    components: { FToggleButton, FMessage, FInfo, FInput, FForm },

    data() {
        return {
            darkModeOn: false,
        };
    },

    created() {
        this.darkModeOn = this.$store.state.darkMode;
    },

    methods: {
        /**
         * @param {string} _value
         * @return {boolean}
         */
        checkSlippageTolerance(_value) {
            let ok = false;
            const value = parseFloat(_value);

            if (!isNaN(value)) {
                ok = value >= 0.1 && value <= 100;
            }

            return ok;
        },

        onFormChange(_event) {
            const { detail } = _event;
            const appNode = this.$root.$children[0];

            if (detail.eTarget.name === 'slippage_tolerance') {
                if (appNode && this.checkSlippageTolerance(detail.value)) {
                    appNode.setFUniswapSlippageTolerance(parseFloat(detail.value));
                }
            } else if (detail.eTarget.name === 'night_mode') {
                appNode.setDarkMode(detail.value === 'on');
            }
        },

        onDarkMode(_event) {
            this.darkModeOn = _event.matches;
            console.log(this.darkModeOn);
        },
    },
};
</script>
