<template>
    <div class="metamaskcustomtokenform">
        <f-form center-form @f-form-submit="onFormSubmit">
            <f-input
                type="text"
                label="Token Contract Address"
                field-size="large"
                name="address"
                validate-on-input
                :validator="checkAddress"
            >
                <template #bottom="sProps">
                    <f-message v-show="sProps.showErrorMessage" type="error" role="alert" with-icon>
                        Invalid Address
                    </f-message>
                </template>
            </f-input>
            <f-input
                type="text"
                label="Token Symbol"
                field-size="large"
                name="symbol"
                validate-on-input
                :validator="checkSymbol"
            >
                <template #bottom="sProps">
                    <f-message v-show="sProps.showErrorMessage" type="error" role="alert" with-icon>
                        Symbol must be 11 characters or fewer
                    </f-message>
                </template>
            </f-input>
            <f-input
                value="18"
                type="number"
                autocomplete="off"
                min="1"
                step="1"
                label="Token Decimals"
                field-size="large"
                name="decimals"
            />

            <div class="align-center form-buttons">
                <button type="submit" class="btn large">Add</button>
            </div>
        </f-form>
    </div>
</template>

<script>
import FForm from '@/components/core/FForm/FForm.vue';
import FInput from '@/components/core/FInput/FInput.vue';
import FMessage from '@/components/core/FMessage/FMessage.vue';

export default {
    name: 'MetamaskCustomTokenForm',

    components: { FMessage, FInput, FForm },

    methods: {
        /**
         * @param {string} _value
         * @return {boolean}
         */
        checkAddress(_value) {
            return this.$fWallet.isValidAddress(_value);
        },

        /**
         * @param {string} _value
         * @return {boolean}
         */
        checkSymbol(_value) {
            const value = _value.trim();

            return value.length > 0 && value.length <= 11;
        },

        /**
         * @param {{detail: {data: {}}}} _event
         */
        onFormSubmit(_event) {
            const { data } = _event.detail;

            if (this.checkAddress(data.address) && this.checkSymbol(data.symbol)) {
                this.$emit('custom-token-form-data', { ...data, decimals: parseInt(data.decimals) });
            }
        },
    },
};
</script>
