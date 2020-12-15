<template>
    <div class="transaction-confirmation">
        <tx-confirmation
            :tx="tx"
            confirmation-comp-name="transaction-confirmation"
            send-button-label="Send"
            password-label="Please enter your wallet password to send the transaction"
            :on-send-transaction-success="onSendTransactionSuccess"
            @change-component="onChangeComponent"
        >
            <h2 class="cont-with-back-btn">
                <span v-if="token.address">
                    Send {{ tokenSymbol }} - Confirmation <span class="f-steps"><b>2</b> / 2</span>
                </span>
                <span v-else>
                    Send Opera FTM - Confirmation <span class="f-steps"><b>3</b> / 3</span>
                </span>
                <button type="button" class="btn light" @click="onBackBtnClick">Back</button>
            </h2>

            <div class="transaction-info">
                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Send To</div>
                    <div class="col break-word">
                        {{ sendToAddress }}
                        <span
                            v-show="sendToAddressBalance || sendToAccountName"
                            class="f-row-label"
                            style="display: inline-block"
                        >
                            ( <template v-if="sendToAddressBalance"> {{ sendToAddressBalance }} FTM </template>
                            <template v-if="sendToAccountName">, {{ sendToAccountName }} </template> )
                        </span>
                    </div>
                </div>

                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Send From</div>
                    <div class="col break-word">
                        {{ currentAccount.address }}
                        <span class="f-row-label" style="display: inline-block">
                            ( {{ toFTM(currentAccount.balance) }} FTM
                            <template v-if="currentAccount.name">, {{ currentAccount.name }}</template> )
                        </span>
                    </div>
                </div>

                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Amount</div>
                    <div class="col">{{ txData.amount }}</div>
                </div>

                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Memo</div>
                    <div class="col">{{ txData.memo }}</div>
                </div>

                <!--
                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Fee</div>
                    <div class="col">{{ txData.fee }}</div>
                </div>
                -->
            </div>

            <template #window-content>
                <ol class="f-data-layout">
                    <li>
                        <div class="row no-collapse">
                            <div class="col-3 f-row-label">Send To</div>
                            <div class="col break-word">
                                {{ txData.opera_address }}
                                <span v-show="sendToAddressBalance" class="f-row-label">
                                    <template v-if="sendToAddressBalance">
                                        ( {{ toFTM(sendToAddressBalance.balance) }} FTM )
                                    </template>
                                </span>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="row no-collapse">
                            <div class="col-3 f-row-label">Send From</div>
                            <div class="col break-word">
                                {{ currentAccount.address }}
                                <span class="f-row-label">
                                    <template v-if="currentAccount.name"><br /></template>
                                    ( {{ toFTM(currentAccount.balance) }} FTM
                                    <template v-if="currentAccount.name">, {{ currentAccount.name }}</template> )
                                </span>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="row no-collapse">
                            <div class="col-3 f-row-label">Amount</div>
                            <div class="col">{{ txData.amount }}</div>
                        </div>
                    </li>
                    <li>
                        <div class="row no-collapse">
                            <div class="col-3 f-row-label">Max Fee</div>
                            <div class="col">{{ txData.fee }}</div>
                        </div>
                    </li>
                </ol>
            </template>
        </tx-confirmation>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { findFirstFocusableDescendant } from '../../utils/aria.js';
import { Web3 } from '../../plugins/fantom-web3-wallet.js';
import { toFTM } from '../../utils/transactions.js';
import { formatNumberByLocale } from '../../filters.js';
import TxConfirmation from '../TxConfirmation/TxConfirmation.vue';
import erc20Utils from 'fantom-ledgerjs/src/erc20-utils.js';

export default {
    components: { TxConfirmation },

    props: {
        // transaction data from SendTransactionForm
        txData: {
            type: Object,
            default() {
                return {};
            },
        },
        /** @type {DefiToken} */
        token: {
            type: Object,
            default() {
                return {};
            },
        },
    },

    data() {
        return {
            sendToAddress: '',
            dTxData: this.txData,
            tx: {},
        };
    },

    computed: {
        ...mapGetters(['currentAccount', 'sendDirection', 'getAccountByAddress']),

        /**
         * @return {string}
         */
        tokenSymbol() {
            const { token } = this;

            return token.address ? this.$defi.getTokenSymbol(token) : 'FTM';
        },

        /**
         * @return {number}
         */
        maxRemainingErc20TokenBalance() {
            const { token } = this;

            return this.$defi.fromTokenValue(token.availableBalance, token) || 0;
        },

        sendToAccountName() {
            const account = this.sendToAddress ? this.getAccountByAddress(this.sendToAddress) : null;

            return account ? account.name : '';
        },
    },

    asyncComputed: {
        async sendToAddressBalance() {
            const { sendDirection } = this;
            let balance = 0;
            let data;

            if (sendDirection === 'OperaToOpera') {
                data = await this.$fWallet.getBalance(this.txData.opera_address);
                balance = this.toFTM(data.balance);
            } else if (sendDirection === 'OperaToBinance') {
                data = await this.$bnb.getBNBBalances(this.txData.bnb_address);
                balance = `BNB address: ${this.txData.bnb_address}, ${formatNumberByLocale(data.balance)}`;
            } else if (sendDirection === 'OperaToEthereum') {
                data = await this.$bnb.getETHBalance(this.txData.eth_address);
                balance = `ETH address: ${this.txData.eth_address}, ${formatNumberByLocale(data)}`;
            }

            return balance;
        },
    },

    created() {
        /** Data for token swap. */
        this._swapTokenData = null;
    },

    mounted() {
        if (!this.currentAccount.isLedgerAccount) {
            const el = findFirstFocusableDescendant(this.$el);
            if (el) {
                el.focus();
            }
        }

        // this.setSendToAddress();
    },

    /**
     * Called when component is activated through `keep-alive`.
     */
    activated() {
        this.setSendToAddress();
    },

    methods: {
        async setSendToAddress() {
            const { sendDirection } = this;
            let data;
            let stData = null;

            if (sendDirection === 'OperaToOpera') {
                this.sendToAddress = this.txData.opera_address;
            } else if (sendDirection === 'OperaToBinance') {
                stData = {
                    direction: sendDirection,
                    bnbAddress: this.txData.bnb_address,
                };
            } else if (sendDirection === 'OperaToEthereum') {
                stData = {
                    direction: sendDirection,
                    ethAddress: this.txData.eth_address,
                };
            }

            if (stData) {
                data = await this.$bnb.swapToken(stData);

                this._swapTokenData = {
                    from_opera_address: this.currentAccount.address,
                    ...this.txData,
                    ...data,
                };
                this.sendToAddress = data.opera_address;
                this.dTxData.opera_address = data.opera_address;

                // console.log('_swapTokenData', this._swapTokenData);
            }

            this.setTx();
        },

        async setTx() {
            const from = this.currentAccount ? this.currentAccount.address : '';
            const { dTxData } = this;
            const fWallet = this.$fWallet;
            const { token } = this;

            if (token.address) {
                this.tx = await this.$fWallet.getDefiTransactionToSign(
                    erc20Utils.erc20TransferTx(
                        token.address,
                        fWallet.toChecksumAddress(dTxData.opera_address),
                        parseFloat(dTxData.amount) === this.maxRemainingErc20TokenBalance
                            ? token.availableBalance
                            : Web3.utils.toHex(Web3.utils.toWei(dTxData.amount))
                    ),
                    this.currentAccount.address
                );
            } else {
                this.tx = await fWallet.getTransactionToSign({
                    value: Web3.utils.toHex(Web3.utils.toWei(dTxData.amount)),
                    from,
                    to: fWallet.toChecksumAddress(dTxData.opera_address),
                    memo: dTxData.memo,
                });
            }
        },

        onSendTransactionSuccess(_data) {
            if (this._swapTokenData) {
                this.$emit('change-component', {
                    to: 'transaction-completing',
                    from: 'transaction-confirmation',
                    data: {
                        tx: _data.data.sendTransaction.hash,
                        ...this._swapTokenData,
                    },
                });
            } else {
                this.$emit('change-component', {
                    to: 'transaction-success-message',
                    from: 'transaction-confirmation',
                    data: {
                        tx: _data.data.sendTransaction.hash,
                        continueTo: 'account-history',
                    },
                });
            }
        },

        /**
         * Re-target `'change-component'` event.
         *
         * @param {object} _data
         */
        onChangeComponent(_data) {
            this.$emit('change-component', _data);
        },

        onBackBtnClick() {
            this.$emit('change-component', {
                to: 'send-transaction-form',
                from: 'transaction-confirmation',
            });
        },

        toFTM,
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
