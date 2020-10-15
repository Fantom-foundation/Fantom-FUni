<template>
    <div class="private-key-form">
        <f-form @f-form-submit="onFormSubmit">
            <fieldset>
                <legend class="not-visible">Private key</legend>

                <div class="form-body">
                    <div class="main">
                        <f-input
                            v-model="dPk"
                            type="text"
                            label="Please type in your private key"
                            field-size="large"
                            name="pk"
                            @input="onPkInput"
                        />

                        <f-message v-if="dErrorMsg" type="error" with-icon>{{ dErrorMsg }}</f-message>
                    </div>

                    <div class="footer">
                        <button type="submit" class="btn large" :disabled="dDisabled">Unlock wallet</button>
                    </div>
                </div>
            </fieldset>
        </f-form>
    </div>
</template>

<script>
import FForm from '../core/FForm/FForm.vue';
import { mapGetters } from 'vuex';
import FInput from '../core/FInput/FInput.vue';
import FMessage from '../core/FMessage/FMessage.vue';

export default {
    components: {
        FMessage,
        FInput,
        FForm,
    },

    data() {
        return {
            dPk: '',
            dDisabled: true,
            dErrorMsg: '',
        };
    },

    computed: {
        cPk() {
            return this.$fWallet.isPrivateKey(this.dPk.trim());
        },
        ...mapGetters(['getAccountByAddress']),
    },

    methods: {
        onFormSubmit(_event) {
            const pk = this.cPk;
            const account = this.$fWallet.restoreAccountByPrivateKey(pk);

            this.dErrorMsg = '';

            if (this.getAccountByAddress(account.address)) {
                this.dErrorMsg = 'An account with this address already exist';
                this.dPk = '';
            } else {
                _event.detail.data.pk = pk;
                this.$emit('f-form-submit', _event);
            }
        },

        onPkInput() {
            const pk = this.cPk;

            this.dDisabled = !pk;

            if (!this.dDisabled) {
                this.dPk = pk;
            }
        },
    },
};
</script>

<style lang="scss"></style>
