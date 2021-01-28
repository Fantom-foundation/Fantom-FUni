<template>
    <div class="tx-confirmation">
        <f-card class="f-card-double-padding f-data-layout" :off="cardOff">
            <slot></slot>

            <transaction-confirmation-form
                :error-message="errorMsg"
                :show-password-field="!currentAccount.isLedgerAccount && !currentAccount.isMetamaskAccount"
                :password-label="passwordLabel"
                :send-button-label="sendButtonLabel"
                :waiting="waiting"
                :disabled-submit="disabledSubmit"
                :gas-limit="dGasLimit"
                @f-form-submit="onFFormSubmit"
            />
        </f-card>

        <f-window
            v-if="currentAccount.isLedgerAccount"
            ref="confirmationWindow"
            modal
            title="Transaction Confirmation"
            style="max-width: 800px"
            animation-in="scale-center-enter-active"
            animation-out="scale-center-leave-active"
        >
            <!--                <icon data="@/assets/svg/nano-s-confirm-tx.svg" width="300" height="91" />-->
            <div class="align-center"><img src="img/nano-s-confirm-tx.png" alt="fantom nano device" /><br /><br /></div>

            <p class="align-center">Please confirm this transaction on your Ledger device:</p>

            <slot name="window-content"></slot>
        </f-window>

        <f-window
            v-if="currentAccount.isMetamaskAccount"
            ref="metamaskNoticeWindow"
            modal
            title="Notice"
            class="double-body-padding"
            style="max-width: 560px"
            animation-in="scale-center-enter-active"
            animation-out="scale-center-leave-active"
        >
            <div class="align-center">
                <div v-if="!$metamask.isInstalled()">Metamask is not installed.</div>
                <div v-else-if="!$metamask.isCorrectChainId()">Please, select Opera chain in Metamask.</div>
                <div v-else-if="metamaskAccount !== currentAccount.address">
                    Please, select account <b>{{ currentAccount.address }}</b> in Metamask.
                </div>
            </div>
        </f-window>
    </div>
</template>

<script>
import FCard from '../core/FCard/FCard.vue';
import FWindow from '../core/FWindow/FWindow.vue';
import TransactionConfirmationForm from '../forms/TransactionConfirmationForm.vue';
import { mapGetters, mapState } from 'vuex';
import gql from 'graphql-tag';
import { UPDATE_ACCOUNT_BALANCE } from '../../store/actions.type.js';
import appConfig from '../../../app.config.js';

/**
 * Base component for other 'transaction confirmation and send' components.
 */
export default {
    name: 'TxConfirmation',

    components: { TransactionConfirmationForm, FWindow, FCard },

    props: {
        /** Transaction object to send */
        tx: {
            type: Object,
            default() {
                return null;
            },
            required: true,
        },
        /** Name of confirmation component in cebab case */
        confirmationCompName: {
            type: String,
            default: '',
        },
        /** Label for button in TransactionConfirmationForm component */
        sendButtonLabel: {
            type: String,
            default: '',
        },
        /** Label for password field in TransactionConfirmationForm component */
        passwordLabel: {
            type: String,
            default: '',
        },
        /**
         * Function called when transaction was successful
         * @param {object} _data
         */
        onSendTransactionSuccess: {
            type: Function,
            default: null,
        },
        /** Don't render card */
        cardOff: {
            type: Boolean,
            default: false,
        },
        /** Set temporary password */
        setTmpPwd: {
            type: Boolean,
            default: false,
        },
        /** Count of usage of temporary password */
        tmpPwdCount: {
            type: Number,
            default: 1,
        },
    },

    data() {
        return {
            errorMsg: '',
            error: null,
            waiting: false,
            disabledSubmit: true,
            dGasLimit: '',
        };
    },

    computed: {
        ...mapState('metamask', {
            metamaskAccount: 'account',
            metamaskChainId: 'chainId',
        }),

        ...mapGetters(['currentAccount']),
    },

    watch: {
        metamaskAccount() {
            if (this.areMetamaskParamsOk()) {
                this.$refs.metamaskNoticeWindow.hide();
            } else {
                this.$refs.metamaskNoticeWindow.show();
            }
        },

        metamaskChainId() {
            if (this.areMetamaskParamsOk()) {
                this.$refs.metamaskNoticeWindow.hide();
            } else {
                this.$refs.metamaskNoticeWindow.show();
            }
        },

        tx() {
            this.init();
        },
    },

    methods: {
        async init() {
            this.dGasLimit = this.tx.gasLimit;
            this.disabledSubmit = false;
        },

        sendTransaction(_rawTransaction) {
            this.$apollo
                .mutate({
                    mutation: gql`
                        mutation($tx: Bytes!) {
                            sendTransaction(tx: $tx) {
                                hash
                                from
                                to
                            }
                        }
                    `,
                    variables: {
                        tx: _rawTransaction,
                    },
                })
                .then((_data) => {
                    if (this.onSendTransactionSuccess) {
                        this.onSendTransactionSuccess(_data);
                    }
                })
                .catch((_error) => {
                    this.errorMsg = _error;
                });
        },

        async onFFormSubmit(_event) {
            const { currentAccount } = this;
            const fWallet = this.$fWallet;
            const pwd = _event.detail.data.pwd;
            let rawTx = null;

            _event.detail.data.pwd = '';

            if (currentAccount && this.tx && fWallet.isValidAddress(this.tx.to)) {
                this.tx.nonce = await fWallet.getTransactionCount(currentAccount.address);
                this.tx.nonce = `0x${this.tx.nonce.toString(16)}`;
                this.tx.chainId = appConfig.chainId;

                // console.log('tx', this.tx);

                if (currentAccount.keystore) {
                    delete this.tx.gasLimit;

                    if (pwd || fWallet.pwdStorage.isSet()) {
                        try {
                            rawTx = await fWallet.signTransaction(this.tx, currentAccount.keystore, pwd);

                            if (this.setTmpPwd && this.tmpPwdCount > 0) {
                                fWallet.pwdStorage.set(pwd, this.tmpPwdCount);
                            }
                        } catch (_error) {
                            console.error(_error);
                            this.errorMsg = _error.toString();
                            // this.errorMsg = 'Invalid password';
                        }
                    }
                } else if (currentAccount.isLedgerAccount) {
                    delete this.tx.gas;

                    try {
                        this.$refs.confirmationWindow.show();

                        rawTx = await this.$fNano.signTransaction(
                            this.tx,
                            currentAccount.accountId,
                            currentAccount.addressId
                        );

                        this.$refs.confirmationWindow.hide('fade-leave-active');
                    } catch (_error) {
                        this.error = _error;
                        this.$refs.confirmationWindow.hide();
                        // this.errorMsg = _error.toString();
                    }
                } else if (currentAccount.isMetamaskAccount) {
                    if (this.areMetamaskParamsOk()) {
                        const from = currentAccount.address;
                        const to = this.tx.to;

                        this.waiting = true;
                        const txHash = await this.$metamask.signTransaction({ ...this.tx }, currentAccount.address);

                        if (this.onSendTransactionSuccess && txHash) {
                            this.onSendTransactionSuccess({
                                data: {
                                    sendTransaction: {
                                        hash: txHash,
                                        from,
                                        to,
                                    },
                                },
                            });
                        }
                    } else {
                        this.$refs.metamaskNoticeWindow.show();
                    }

                    this.waiting = false;
                }

                if (rawTx) {
                    // console.log('rawTx', rawTx);
                    this.sendTransaction(rawTx);

                    setTimeout(() => {
                        this.$store.dispatch(UPDATE_ACCOUNT_BALANCE);
                    }, 3000);
                }
            }
        },

        areMetamaskParamsOk() {
            return (
                this.$metamask.isInstalled() &&
                this.metamaskAccount.toLowerCase() === this.currentAccount.address.toLowerCase() &&
                this.$metamask.isCorrectChainId()
            );
        },
    },
};
</script>
