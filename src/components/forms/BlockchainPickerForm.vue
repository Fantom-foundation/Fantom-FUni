<template>
    <div class="blockchain-picker-form">
        <f-card class="f-card-double-padding">
            <h2>
                Send Opera FTM <span class="f-steps"><b>1</b> / 3</span>
            </h2>

            <h3 class="align-center h2">Which blockchain are you sending FTM to?</h3>

            <div class="bc-picker">
                <f-form ref="form" center-form @f-form-submit="onFormSubmit">
                    <blockchain-picker />

                    <div class="align-center form-buttons">
                        <button type="submit" class="btn large break-word" style="max-width: 100%">Continue</button>
                    </div>
                </f-form>
            </div>
        </f-card>
    </div>
</template>

<script>
import FCard from '../core/FCard/FCard.vue';
import { SET_SEND_DIRECTION } from '../../store/mutations.type.js';
import FForm from '../core/FForm/FForm.vue';
import BlockchainPicker from '../BlockchainPicker/BlockchainPicker.vue';

export default {
    name: 'BlockchainPickerForm',

    components: { BlockchainPicker, FForm, FCard },

    methods: {
        onFormSubmit(_event) {
            const { data } = _event.detail;
            let direction = '';

            if (data.blockchain) {
                switch (data.blockchain) {
                    case 'opera':
                        direction = 'OperaToOpera';
                        break;
                    case 'binance':
                        direction = 'OperaToBinance';
                        break;
                    case 'ethereum':
                        direction = 'OperaToEthereum';
                        break;
                }

                this.$store.commit(SET_SEND_DIRECTION, direction);

                this.$emit('change-component', {
                    to: 'send-transaction-form',
                    from: 'blockchain-picker-form',
                });
            }
        },
    },
};
</script>

<style scoped></style>
