<template>
    <div class="funiswap-swap-confirmation">
        <tx-confirmation
            v-if="hasCorrectParams"
            :tx="tx"
            card-off
            set-tmp-pwd
            :send-button-label="sendButtonLabel"
            :password-label="passwordLabel"
            :show-cancel-button="true"
            :window-mode="true"
            class="min-h-100"
            :on-send-transaction-success="onSendTransactionSuccess"
            @cancel-button-click="$emit('cancel-button-click', $event)"
        >
            <div class="confirmation-info" tabindex="0" data-focus>
                <template v-if="params.step === 1">
                    You’re allowing
                    <span class="price">
                        <f-token-value
                            :value="allowValue"
                            :token="params.fromToken"
                            :use-placeholder="false"
                            no-currency
                        />
                        {{ fromTokenSymbol }}
                    </span>
                </template>
                <template v-else>
                    You're trading expected
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
                    <br /><br />
                    <template v-if="minimumReceived > 0">
                        Minimum Received
                        <span class="price">
                            <f-token-value
                                :value="minimumReceived"
                                :token="params.toToken"
                                :use-placeholder="false"
                                no-currency
                            />
                            {{ toTokenSymbol }}
                        </span>
                    </template>
                    <template v-else>
                        Maximum Spent
                        <span class="price">
                            <f-token-value
                                :value="maximumSold"
                                :token="params.fromToken"
                                :use-placeholder="false"
                                no-currency
                            />
                            {{ fromTokenSymbol }}
                        </span>
                    </template>
                </template>
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
import uniswapUtils from 'fantom-ledgerjs/src/uniswap-utils.js';
import erc20Utils from 'fantom-ledgerjs/src/erc20-utils.js';
import Web3 from 'web3';
import appConfig from '../../../app.config.js';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';

export default {
    name: 'FUniswapSwapConfirmation',

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
            compName: 'funiswap-swap',
            confirmationCompName: 'funiswap-swap',
            priceDecimals: 6,
            tx: {},
            minimumReceived: 0,
            maximumSold: 0,
            allowValue: 0,
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

        increasedDebt() {
            return this.params.currDebt - this.params.debt;
        },

        decreasedDebt() {
            return this.params.debt - this.params.currDebt;
        },

        sendButtonLabel() {
            let label = '';

            // if (this.params.step === 1) {
            //     label = 'Continue to the next step';
            // } else {
            label = 'Submit';
            // label = 'Trade now';
            // }

            return label;
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
            const { params } = this;
            const { $defi } = this;
            const { fromToken } = params;
            const { toToken } = params;
            let txToSign;
            const web3 = new Web3();
            const { slippageTolerance } = params;
            let amounts;

            if (!fromToken || !toToken) {
                return;
            }

            if (params.step === 1) {
                this.allowValue =
                    params.maximumSold > 0 ? params.fromValue * (1 + slippageTolerance) : params.fromValue;
                console.log(params.fromValue, this.allowValue, params.max, params.maximumSold);

                txToSign = erc20Utils.erc20IncreaseAllowanceTx(
                    fromToken.address,
                    $defi.contracts.uniswapRouter,
                    params.max && !params.maximumSold
                        ? fromToken.balanceOf || fromToken.availableBalance
                        : Web3.utils.toHex($defi.shiftDecPointRight(this.allowValue.toString(), fromToken.decimals))
                    // Web3.utils.toHex(this.$defi.shiftDecPointRight((fromValue * 1.05).toString(), fromToken.decimals))
                );
            } else {
                // console.log(fromToken, toToken, params.toValue);
                if (params.minimumReceived > 0) {
                    amounts = await $defi.fetchUniswapAmountsOut(
                        params.max
                            ? fromToken.balanceOf || fromToken.availableBalance
                            : Web3.utils.toHex(
                                  this.$defi.shiftDecPointRight(params.fromValue.toString(), fromToken.decimals)
                              ),
                        [fromToken.address, toToken.address]
                    );

                    // apply slippage tolerance
                    amounts[1] = $defi.fromTokenValue(amounts[1], toToken);
                    amounts[1] *= 1 - slippageTolerance;

                    this.minimumReceived = amounts[1];

                    amounts[1] = Web3.utils.toHex($defi.shiftDecPointRight(amounts[1].toString(), toToken.decimals));

                    txToSign = uniswapUtils.uniswapExactTokensForTokens(
                        web3,
                        $defi.contracts.uniswapRouter,
                        amounts[0],
                        amounts[1],
                        [fromToken.address, toToken.address],
                        this.currentAccount.address,
                        (Math.floor(new Date().getTime() / 1000) + 20 * 60).toString()
                    );
                } else {
                    amounts = await $defi.fetchUniswapAmountsIn(
                        Web3.utils.toHex($defi.shiftDecPointRight(params.toValue.toString(), toToken.decimals)),
                        [fromToken.address, toToken.address]
                    );

                    // apply slippage tolerance
                    amounts[0] = [$defi.fromTokenValue(amounts[0], fromToken)];
                    amounts[0] *= 1 + slippageTolerance;

                    this.maximumSold = amounts[0];

                    amounts[0] = Web3.utils.toHex($defi.shiftDecPointRight(amounts[0].toString(), fromToken.decimals));

                    txToSign = uniswapUtils.uniswapTokensForExactTokens(
                        web3,
                        $defi.contracts.uniswapRouter,
                        amounts[1],
                        amounts[0],
                        [fromToken.address, toToken.address],
                        this.currentAccount.address,
                        (Math.floor(new Date().getTime() / 1000) + 20 * 60).toString()
                    );
                }
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

            if (this.params.step === 1) {
                params.continueTo = `${this.confirmationCompName}-confirmation2`;
                params.continueToParams = { ...this.params, step: 2 };
                params.autoContinueToAfter = appConfig.settings.autoContinueToAfter;
                params.continueButtonLabel = 'Next Step';
                params.title = `${this.params.step}/${this.params.steps}  ${params.title}`;
            } else if (this.params.step === 2) {
                transactionSuccessComp = `${this.confirmationCompName}-transaction-success-message2`;
                params.continueToParams = {
                    fromToken: { ...this.params.fromToken },
                    toToken: { ...this.params.toToken },
                };
            }

            if (this.params.step === 1) {
                params.continueToParams = {
                    props: { ...params.continueToParams },
                };
                params.title = `Success`;
            } else if (this.params.step === 2 || !this.params.step) {
                params.continueTo = 'hide-window';
                params.continueButtonLabel = 'Close';
            }

            this.$emit('change-component', {
                to: transactionSuccessComp,
                data: { ...params, cardOff: true, windowMode: true },
            });
        },

        toFTM,
    },
};
</script>
