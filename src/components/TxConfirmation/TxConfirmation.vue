<template>
    <div class="tx-confirmation">
        <f-card
            class="f-card-double-padding f-data-layout"
            :class="[windowMode ? 'column-layout column-layout--body-footer' : '']"
            :off="cardOff"
        >
            <div :class="{ 'center-v': windowMode }">
                <slot></slot>
            </div>

            <div>
                <ledger-message :error="error" @ledger-status-code="onLedgerStatusCode" />

                <transaction-confirmation-form
                    :error-message="errorMsg"
                    :show-password-field="!currentAccount.isLedgerAccount && !currentAccount.isMetamaskAccount"
                    :password-label="passwordLabel"
                    :send-button-label="sendButtonLabel"
                    :waiting="waiting"
                    :disabled-submit="disabledSubmit"
                    :gas-limit="dGasLimit"
                    :gas-info="gasInfo"
                    :cancel-button-label="cancelButtonLabel"
                    :show-cancel-button="showCancelButton"
                    :max-fee="tx ? tx._fee : -1"
                    @f-form-submit="onFFormSubmit"
                    @cancel-button-click="$emit('cancel-button-click', $event)"
                />
            </div>
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
import { SET_TX_FEE } from '@/store/mutations.type.js';
import { focusElem } from '@/utils/aria.js';
import LedgerMessage from '@/components/LedgerMessage/LedgerMessage.vue';
import { U2FStatus } from '@/plugins/fantom-nano.js';

/**
 * Base component for other 'transaction confirmation and send' components.
 */
export default {
    name: 'TxConfirmation',

    components: { LedgerMessage, TransactionConfirmationForm, FWindow, FCard },

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
        /** Label for button in TransactionConfirmationForm component */
        cancelButtonLabel: {
            type: String,
            default: 'Cancel',
        },
        showCancelButton: {
            type: Boolean,
            default: false,
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
        /** Component is placed in FWindow */
        windowMode: {
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
            gasInfo: {},
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

    mounted() {
        focusElem(this.$el);
    },

    methods: {
        async init() {
            this.dGasLimit = this.tx.gasLimit;
            this.disabledSubmit = false;

            this.gasInfo = {
                gasLimit: this.tx.gasLimit,
                gasPrice: this.tx.gasPrice,
            };

            if (!this.tx.gas && this.tx._error) {
                this.errorMsg = this.tx._error;
            }
        },

        sendTransaction(_rawTransaction) {
            this.$apollo
                .mutate({
                    mutation: gql`
                        mutation ($tx: Bytes!) {
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
            const { data } = _event.detail;
            const pwd = data.pwd;
            let rawTx = null;

            data.pwd = '';

            if (currentAccount && this.tx && fWallet.isValidAddress(this.tx.to)) {
                this.tx.nonce = await fWallet.getTransactionCount(currentAccount.address);
                this.tx.nonce = `0x${this.tx.nonce.toString(16)}`;
                this.tx.chainId = appConfig.chainId;

                if (data.gasLimit) {
                    this.tx.gas = data.gasLimit;
                    this.tx.gasLimit = data.gasLimit;
                }

                if (data.gasPrice) {
                    this.tx.gasPrice = data.gasPrice;
                }

                if (data.gasLimit && data.gasPrice) {
                    this.$store.commit(
                        SET_TX_FEE,
                        fWallet.WEIToFTM(fWallet.getTransactionFee(data.gasPrice, data.gasLimit))
                    );
                } else {
                    this.$store.commit(SET_TX_FEE, this.tx._fee);
                }

                if (!this.tx.gas) {
                    this.errorMsg = this.tx._error || 'Transaction Error';
                    return;
                }

                delete this.tx._error;
                delete this.tx._fee;

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

                        const ledgerApp = currentAccount.isLedgerEthAccount ? this.$ledgerEth : this.$fNano;

                        rawTx = await ledgerApp.signTransaction(
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

        /**
         * Triggered on 'ledger-status-code' event.
         *
         * @param {string} _code
         */
        onLedgerStatusCode(_code) {
            if (_code === U2FStatus.USER_REJECTED_REQUESTED_ACTION) {
                this.$emit('change-component', {
                    to: 'transaction-reject-message',
                    from: this.confirmationCompName,
                });
            }
        },
    },
};
</script>
