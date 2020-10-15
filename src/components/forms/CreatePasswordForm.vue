<template>
    <div class="keystore-password-form">
        <f-form @f-form-submit="onFormSubmit" @f-form-change="onFormChange" @f-form-input="onFormInput">
            <fieldset class="">
                <legend class="h2">
                    <template v-if="downloadKeystoreFile"> Create a keystore file and password </template>
                    <template v-else> Set the password for your wallet </template>
                </legend>

                <div class="form-body">
                    <div class="main">
                        <f-password-field
                            v-model="primaryPwd"
                            :label="cSetPasswordT"
                            type="password"
                            field-size="large"
                            name="primaryPwd"
                            :validator="checkPrimaryPassword"
                            validate-on-input
                        >
                            <template #bottom="sProps">
                                <f-message v-show="sProps.showErrorMessage" type="error" role="alert" with-icon>
                                    Make sure to enter at least 8 and max 200 characters, including one upper-case
                                    letter, a symbol and a number
                                </f-message>
                                <f-message v-show="!sProps.showErrorMessage" type="info" with-icon>
                                    Make sure to enter at least 8 and max 200 characters, including one upper-case
                                    letter, a symbol and a number
                                </f-message>
                            </template>
                        </f-password-field>

                        <f-password-field
                            v-model="secondaryPwd"
                            label="Re-enter password"
                            type="password"
                            field-size="large"
                            name="secondaryPwd"
                            :validator="checkSecondaryPassword"
                            validate-on-input
                        >
                            <template #bottom="sProps">
                                <f-message v-show="sProps.showErrorMessage" type="error" role="alert" with-icon>
                                    The entered password does not match
                                </f-message>
                            </template>
                        </f-password-field>

                        <f-checkbox v-model="confirmation" name="confirmation">
                            <template v-if="downloadKeystoreFile">
                                I understand that I will need both the keystore file and the password to access my
                                wallet. Once I have downloaded the file below, I will safely store it as well as the
                                password
                            </template>
                            <template v-else>
                                I understand that I will need this password to verify all transactions within my wallet.
                                I will safely store the password.
                            </template>
                        </f-checkbox>
                    </div>

                    <div class="footer">
                        <button
                            type="submit"
                            class="btn large break-word"
                            style="max-width: 100%"
                            :class="{ disabled: submitDisabled }"
                        >
                            <template v-if="downloadKeystoreFile"> Download keystore file and continue </template>
                            <template v-else> Continue </template>
                        </button>
                    </div>
                </div>
            </fieldset>
        </f-form>
    </div>
</template>

<script>
import FForm from '../core/FForm/FForm.vue';
import { ADD_ACCOUNT } from '../../store/actions.type.js';
import { findFirstFocusableDescendant } from '../../utils/aria.js';
import FCheckbox from '../core/FCheckbox/FCheckbox.vue';
import FMessage from '../core/FMessage/FMessage.vue';
import FPasswordField from '../core/FPasswordField/FPasswordField.vue';
import { clientInfo } from '../../utils/client-info.js';

export default {
    components: {
        FPasswordField,
        FMessage,
        FForm,
        FCheckbox,
    },

    props: {
        // created from restore account view
        restoreAccount: {
            type: Boolean,
            default: false,
        },
        // private key
        privateKey: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            primaryPwd: '',
            secondaryPwd: '',
            confirmation: false,
            submitDisabled: true,
            downloadKeystoreFile: !clientInfo.mobile && !this.restoreAccount,
        };
    },

    computed: {
        cSetPasswordT() {
            return this.restoreAccount ? 'Set a new password' : 'Set a password';
        },
    },

    mounted() {
        const el = findFirstFocusableDescendant(this.$el);
        if (el) {
            el.focus();
        }
    },

    methods: {
        checkPrimaryPassword(_value) {
            return this.$fWallet.checkPrimaryPassword(_value);
        },

        checkSecondaryPassword(_value) {
            return _value === this.primaryPwd && _value.length > 0;
        },

        checkPasswords() {
            return this.checkPrimaryPassword(this.primaryPwd) && this.checkSecondaryPassword(this.secondaryPwd);
        },

        validate() {
            return this.checkPasswords() && this.confirmation;
        },

        onFormInput() {
            this.submitDisabled = !this.validate();
        },

        onFormChange() {
            this.submitDisabled = !this.validate();
        },

        async onFormSubmit(_event) {
            const pwd = _event.detail.data.primaryPwd;
            let account = null;
            let keystore = null;
            const fWallet = this.$fWallet;

            if (this.validate()) {
                if (pwd) {
                    if (this.privateKey) {
                        // from restore account - private key, mnemonic
                        keystore = fWallet.encryptToKeystore(this.privateKey, pwd);
                    } else if (this.restoreAccount) {
                        // from restore account - keystore
                        account = fWallet.createAccount();
                        keystore = fWallet.encryptToKeystore(account.privateKey, pwd);

                        account = null;
                    }

                    if (keystore) {
                        // fWallet.downloadKeystore(keystore);

                        if (this.restoreAccount) {
                            // save account
                            this.$store.dispatch(ADD_ACCOUNT, keystore);
                            // go to success view
                            this.$emit('change-component', {
                                detail: {
                                    from: 'create-password-form',
                                    to: 'account-success-message',
                                    data: {
                                        address: fWallet.toChecksumAddress(keystore.address),
                                    },
                                },
                            });
                        }
                    } else if (!this.restoreAccount) {
                        // create new account
                        account = await this.$fWallet.createMnemonic(pwd);

                        if (this.downloadKeystoreFile) {
                            fWallet.downloadKeystore(account.keystore);
                        }

                        this.$emit('change-component', {
                            detail: {
                                from: 'create-password-form',
                                data: { account },
                            },
                        });
                    }
                }
            }
        },
    },
};
</script>

<style lang="scss"></style>
