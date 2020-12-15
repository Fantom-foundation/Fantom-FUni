<template>
    <div class="funiswap-swap-confirmation">
        <tx-confirmation
            v-if="hasCorrectParams"
            :tx="tx"
            card-off
            set-tmp-pwd
            send-button-label="Submit"
            :password-label="passwordLabel"
            :on-send-transaction-success="onSendTransactionSuccess"
            @change-component="onChangeComponent"
        >
            <h1 class="with-back-btn">
                <f-back-button
                    v-if="!params.steps || params.step === 1"
                    :route-name="backButtonRoute"
                    :params="{ fromToken: params.fromToken, toToken: params.toToken }"
                />
                Confirm Swap
                <template v-if="params.steps">({{ params.step }}/{{ params.steps }})</template>
            </h1>

            <div class="confirmation-info">
                You're trading
                <span class="price">
                    {{ params.fromValue.toFixed($defi.getTokenDecimals(params.fromToken)) }} {{ fromTokenSymbol }}
                </span>
                &#10141;
                <span class="price">
                    {{ params.toValue.toFixed($defi.getTokenDecimals(params.toToken)) }} {{ toTokenSymbol }}
                </span>
            </div>

            <template #window-content>
                <ledger-confirmation-content :to="tx.to" :amount="0" />
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
import FBackButton from '../../components/core/FBackButton/FBackButton.vue';
import { getAppParentNode } from '../../app-structure.js';
import FMessage from '../../components/core/FMessage/FMessage.vue';
import Web3 from 'web3';
import wftmUtils from 'fantom-ledgerjs/src/wftm-utils.js';

export default {
    name: 'FUniswapWrapFTMConfirmation',

    components: { FMessage, FBackButton, LedgerConfirmationContent, TxConfirmation },

    props: {
        /** Address of smart contract. */
        contractAddress: {
            type: String,
            default: '',
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
            const { $route } = this;

            return $route && $route.params ? $route.params : {};
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
        if (!this.hasCorrectParams) {
            // redirect to <this.compName>
            setTimeout(() => {
                this.$router.replace({ name: this.compName });
            }, 3000);
        } else {
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

            this.$router.replace({
                name: transactionSuccessComp,
                params,
            });
        },

        /**
         * Re-target `'change-component'` event.
         *
         * @param {object} _data
         */
        onChangeComponent(_data) {
            let transactionRejectComp = `${this.confirmationCompName}-transaction-reject-message`;

            if (_data.to === 'transaction-reject-message') {
                this.$router.replace({
                    name: transactionRejectComp,
                    params: {
                        continueTo: this.compName,
                        continueToParams: {
                            fromToken: { ...this.params.fromToken },
                            toToken: { ...this.params.toToken },
                        },
                    },
                });
            }
        },

        toFTM,
    },
};
</script>
