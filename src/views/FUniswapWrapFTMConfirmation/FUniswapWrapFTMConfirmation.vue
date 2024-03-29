<template>
    <div class="funiswap-swap-confirmation">
        <tx-confirmation
            v-if="hasCorrectParams"
            :tx="tx"
            card-off
            set-tmp-pwd
            send-button-label="Submit"
            :password-label="passwordLabel"
            :show-cancel-button="true"
            :window-mode="true"
            class="min-h-100"
            :on-send-transaction-success="onSendTransactionSuccess"
            @cancel-button-click="$emit('cancel-button-click', $event)"
        >
            <div class="confirmation-info" tabindex="0" data-focus>
                You're trading
                <span class="price">
                    <f-token-value
                        :value="params.fromValue"
                        :token="params.fromToken"
                        :use-placeholder="false"
                        no-currency
                    />
                    {{ fromTokenSymbol }}
                </span>
                &#10141;
                <span class="price">
                    <f-token-value
                        :value="params.toValue"
                        :token="params.toToken"
                        :use-placeholder="false"
                        no-currency
                    />
                    {{ toTokenSymbol }}
                </span>
            </div>

            <template #window-content>
                <ledger-confirmation-content :to="tx.to" :amount="0" :max-fee="tx._fee" />
            </template>
        </tx-confirmation>
        <template v-else>
            <f-message type="info" role="alert" class="big"> Trade tokens first, please. </f-message>
        </template>
    </div>
</template>

<script>
import TxConfirmation from '../../components/TxConfirmation/TxConfirmation.vue';
import LedgerConfirmationContent from '../../components/LedgerConfirmationContent/LedgerConfirmationContent.vue';
import { mapGetters } from 'vuex';
import { toFTM } from '../../utils/transactions.js';
import { getAppParentNode } from '../../app-structure.js';
import FMessage from '../../components/core/FMessage/FMessage.vue';
import Web3 from 'web3';
import wftmUtils from 'fantom-ledgerjs/src/wftm-utils.js';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';

export default {
    name: 'FUniswapWrapFTMConfirmation',

    components: { FTokenValue, FMessage, LedgerConfirmationContent, TxConfirmation },

    props: {
        /** Address of smart contract. */
        contractAddress: {
            type: String,
            default: '',
        },
        props: {
            type: Object,
            default() {
                return {};
            },
        },
    },

    data() {
        return {
            compName: 'funiswap-wrap-ftm',
            confirmationCompName: 'funiswap-wrap-ftm',
            tx: {},
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        /**
         * @return {{fromValue: number, toValue: number, fromToken: DefiToken, toToken: DefiToken}}
         */
        params() {
            return this.props;
        },

        hasCorrectParams() {
            return !!this.params.fromValue;
        },

        passwordLabel() {
            let label = '';

            if (this.params.step === 1) {
                label = 'Please enter your wallet password to allow your tokens';
            } else {
                label = 'Please enter your wallet password to trade your tokens';
            }

            return label;
        },

        fromTokenSymbol() {
            return this.$defi.getTokenSymbol(this.params.fromToken);
        },

        toTokenSymbol() {
            return this.$defi.getTokenSymbol(this.params.toToken);
        },

        backButtonRoute() {
            const parentNode = getAppParentNode(`${this.confirmationCompName}-confirmation`);

            return parentNode ? parentNode.route : '';
        },
    },

    created() {
        if (this.hasCorrectParams) {
            this.setTx();
        }
    },

    methods: {
        async setTx() {
            let { contractAddress } = this;

            const { params } = this;
            const { fromToken } = params;
            const { toToken } = params;
            let txToSign;

            if (!fromToken || !toToken) {
                return;
            }

            if (!contractAddress) {
                contractAddress = this.$defi.contracts.fMint;
            }

            if (fromToken.symbol === 'FTM' && toToken.canWrapFTM) {
                txToSign = wftmUtils.defiWrapFtm(
                    toToken.address,
                    Web3.utils.toHex(this.$defi.shiftDecPointRight(params.toValue.toString(), toToken.decimals))
                );
            } else if (fromToken.canWrapFTM && toToken.symbol === 'FTM') {
                txToSign = wftmUtils.defiUnwrapFtm(
                    fromToken.address,
                    params.max
                        ? fromToken.availableBalance
                        : Web3.utils.toHex(this.$defi.shiftDecPointRight(params.fromValue.toString(), toToken.decimals))
                );
            }

            if (txToSign) {
                this.tx = await this.$fWallet.getDefiTransactionToSign(txToSign, this.currentAccount.address);
            }
        },

        onSendTransactionSuccess(_data) {
            const params = {
                tx: _data.data.sendTransaction.hash,
                title: 'Success',
                continueTo: this.compName,
            };
            let transactionSuccessComp = `${this.confirmationCompName}-transaction-success-message`;

            params.continueToParams = {
                fromToken: { ...this.params.fromToken },
                toToken: { ...this.params.toToken },
            };
            params.continueTo = 'hide-window';
            params.continueButtonLabel = 'Close';

            this.$emit('change-component', {
                to: transactionSuccessComp,
                data: { ...params, cardOff: true, windowMode: true },
            });
        },

        toFTM,
    },
};
</script>
