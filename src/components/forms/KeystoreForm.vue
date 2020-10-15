<template>
    <div class="keystore-form">
        <f-form ref="keystore-form" @f-form-submit="onFormSubmit">
            <fieldset>
                <legend class="not-visible">Keystore file</legend>

                <div class="form-body">
                    <div class="main">
                        <br />

                        <f-file-input-button
                            name="keystore-file"
                            accept="application/json"
                            class="secondary large w100p"
                            @change="onKeystoreFileChange"
                        >
                            <icon data="@/assets/svg/upload.svg" width="20" height="20"></icon> &nbsp; Upload keystore
                            file
                        </f-file-input-button>
                        <f-message v-if="dKeystoreUploadMsg && !dKeystoreErrorMsg" type="success" with-icon>
                            {{ dKeystoreUploadMsg }}
                        </f-message>
                        <br />

                        <f-message v-if="dKeystoreErrorMsg" type="error" with-icon>
                            {{ dKeystoreErrorMsg }}
                        </f-message>
                        <br />

                        <f-password-field
                            v-model="pwd"
                            label="Enter your wallet password"
                            field-size="large"
                            autocomplete="off"
                            name="pwd"
                            validate-on-input
                            :validator="checkPassword"
                        >
                            <template #bottom="sProps">
                                <f-message v-show="sProps.showErrorMessage" type="error" role="alert" with-icon>
                                    Type a password
                                </f-message>
                            </template>
                        </f-password-field>

                        <f-message v-if="dErrorMsg" type="error" with-icon>{{ dErrorMsg }}</f-message>
                    </div>

                    <div class="footer">
                        <button type="submit" class="btn large" :disabled="dSubmitDisabled">Unlock wallet</button>
                    </div>
                </div>
            </fieldset>
        </f-form>
    </div>
</template>

<script>
import FForm from '../core/FForm/FForm.vue';
import FFileInputButton from '../core/FFileInputButton/FFileInputButton.vue';
import { FileReaderP } from '../../utils/file-reader.js';
import { mapGetters } from 'vuex';
import FMessage from '../core/FMessage/FMessage.vue';
import FPasswordField from '../core/FPasswordField/FPasswordField.vue';

export default {
    components: {
        FPasswordField,
        FMessage,
        FForm,
        FFileInputButton,
    },

    data() {
        return {
            dPrimaryPwdOk: true,
            dSubmitDisabled: true,
            dKeystoreErrorMsg: '',
            dKeystoreUploadMsg: '',
            dErrorMsg: '',
            pwd: '',
        };
    },

    computed: {
        ...mapGetters(['getAccountByAddress']),
    },

    created() {
        this._fileReader = new FileReaderP();
        this._keystore = null;
    },

    beforeDestroy() {
        this._fileReader = null;
    },

    methods: {
        checkForm() {
            this.dSubmitDisabled = !this.pwd || this._keystore === null;
        },

        checkPassword(_value) {
            const ok = _value.length > 0;

            this.checkForm();

            return ok;
        },

        async onKeystoreFileChange(_event) {
            const files = _event.target.files;

            if (files.length === 1) {
                try {
                    this._keystore = await this._fileReader.readAsJSON(files[0]);
                    this.dKeystoreErrorMsg = '';
                    this.dKeystoreUploadMsg = 'Keystore sucessfully loaded';
                    this.checkForm();
                } catch (e) {
                    this._keystore = null;
                    this.dKeystoreErrorMsg = 'Not valid JSON file.';
                    this.checkForm();
                }
            }
        },

        onFormSubmit(_event) {
            try {
                const account = this.$fWallet.decryptFromKeystore(this._keystore, this.pwd);

                if (account) {
                    if (this.getAccountByAddress(account.address)) {
                        this.dErrorMsg = 'An account with this address already exist';
                    } else {
                        _event.detail.data.keystore = this._keystore;
                        this.$emit('f-form-submit', _event);
                    }
                }

                this._keystore = null;
                this.pwd = '';
            } catch (_error) {
                this.dErrorMsg = 'Bad keystore file or password.';
            }
        },
    },
};
</script>

<style lang="scss"></style>
