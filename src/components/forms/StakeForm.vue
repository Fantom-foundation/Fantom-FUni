<template>
    <div class="stake-form account-main-content-mt" :class="{ 'increase-delegation': increaseDelegation }">
        <f-card class="f-card-double-padding">
            <f-form ref="stakeForm" center-form @f-form-submit="onFormSubmit">
                <fieldset class="">
                    <legend class="h2 cont-with-back-btn">
                        <span
                            >Delegate FTM <span class="f-steps"><b>1</b> / 2</span></span
                        >
                        <a
                            href="#"
                            class="btn light break-word"
                            style="max-width: 100%"
                            aria-label="Go to previous form"
                            @click.prevent="onPreviousBtnClick"
                        >
                            Back
                        </a>
                    </legend>

                    <div class="form-body">
                        <f-input
                            v-model="amount"
                            label="Amount"
                            field-size="large"
                            type="number"
                            autocomplete="off"
                            min="1"
                            step="any"
                            name="amount"
                            :validator="checkAmount"
                            validate-on-input
                        >
                            <template #top="sProps">
                                <div class="input-label-layout">
                                    <label :for="sProps.inputId">{{ sProps.label }}</label>
                                    <button type="button" class="btn light small" @click="onEntireBalanceClick">
                                        Entire Balance -2 FTM
                                    </button>
                                </div>
                            </template>
                            <template #bottom="sProps">
                                <f-message v-show="sProps.showErrorMessage" type="error" role="alert" with-icon>
                                    {{ amountErrMsg }}
                                </f-message>
                            </template>
                        </f-input>

                        <f-input
                            v-model="validator"
                            label="Validator"
                            field-size="large"
                            autocomplete="off"
                            name="validator"
                            readonly
                            :disabled="increaseDelegation"
                            disabled-as-text
                            class="validator-select"
                            :validator="checkValidator"
                            validate-on-input
                            @click.native="onSelectValidatorClick"
                            @keydown.native="onSelectValidatorKeyup"
                        >
                            <template #suffix>
                                <span class="btn same-size round small light">
                                    <icon data="@/assets/svg/chevron-down.svg" color="rgb(140,140,140)" />
                                </span>
                            </template>
                            <template #bottom="sProps">
                                <f-message v-show="sProps.showErrorMessage" type="error" role="alert" with-icon>
                                    {{ validatorErrMsg }}
                                </f-message>
                            </template>
                        </f-input>

                        <div class="align-center form-buttons">
                            <button type="submit" class="btn large break-word" style="max-width: 100%">Continue</button>
                        </div>
                    </div>
                </fieldset>
            </f-form>
        </f-card>

        <validator-picker-window ref="validatorPickerWindow" @validator-selected="onValidatorSelected" />
    </div>
</template>

<script>
import FCard from '../core/FCard/FCard.vue';
import FForm from '../core/FForm/FForm.vue';
import FMessage from '../core/FMessage/FMessage.vue';
import FInput from '../core/FInput/FInput.vue';
import ValidatorPickerWindow from '../windows/ValidatorPickerWindow.vue';
import { mapGetters } from 'vuex';
import { isAriaAction } from '../../utils/aria.js';
import sfcUtils from 'fantom-ledgerjs/src/sfc-utils.js';
import { GAS_LIMITS } from '../../plugins/fantom-web3-wallet.js';

// import { formatHexToInt } from '../../filters.js';
// import { WEIToFTM } from '../../utils/transactions.js';

export default {
    name: 'StakeForm',

    components: { ValidatorPickerWindow, FInput, FMessage, FForm, FCard },

    props: {
        /** Increase delegation mode. */
        increaseDelegation: {
            type: Boolean,
            default: false,
        },
        /** Validator info. */
        stakerInfo: {
            type: Object,
            default() {
                return {};
            },
        },
        /** Name of previous component. */
        previousComponent: {
            type: String,
            default: 'staking-info',
        },
        /** */
        stakerId: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            amountErrMsg: 'Invalid amount',
            gasPrice: '',
            validator: 'Select a Validator',
            validatorErrMsg: 'Please select a validator',
            /** Info about selected validator. */
            validatorInfo: {
                address: '',
                id: '',
                name: '',
            },
            amount: '',
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),

        /**
         * @return {number}
         */
        remainingBalance() {
            const { currentAccount } = this;
            let price = 0;

            if (this.gasPrice && currentAccount) {
                price = this.$fWallet.getRemainingBalance(currentAccount.balance, this.gasPrice, GAS_LIMITS.delegate);
            }

            return price;
        },

        /**
         * @return {number}
         */
        maxRemainingBalance() {
            const { currentAccount } = this;
            let price = 0;

            if (this.gasPrice && currentAccount) {
                price = this.$fWallet.getMaxRemainingBalance(currentAccount.balance, this.gasPrice);
            }

            return price;
        },
    },

    created() {
        this.$fWallet.getGasPrice().then((_gasPrice) => {
            this.gasPrice = _gasPrice;
        });
    },

    // activated() {
    mounted() {
        const { stakerInfo } = this;

        this.validator = 'Select a Validator';
        this.validatorInfo = {
            address: '',
            id: '',
            name: '',
        };

        if (stakerInfo && stakerInfo.id) {
            this.validatorInfo = {
                id: stakerInfo.id,
                address: stakerInfo.stakerAddress,
                name: stakerInfo.stakerInfo.name,
            };

            this.updateValidatorInfo().then(() => {
                this.validator = `${this.validatorInfo.name}, ${parseInt(this.validatorInfo.id, 16)}`;
            });
        }
    },

    methods: {
        /**
         * Validator for `amount` input field.
         *
         * @param {String} _value
         * @return {Boolean}
         */
        checkAmount(_value) {
            const remainingBalance = parseFloat(this.remainingBalance);
            const value = parseFloat(_value);
            let ok = false;

            this.amountErrMsg = 'Invalid amount';

            // await this.$fWallet.getStakerById(accountInfo.stakerIdHex)

            if (!isNaN(value)) {
                if (value <= remainingBalance && value >= 1) {
                    ok = true;
                } else if (remainingBalance < 0) {
                    this.amountErrMsg = `You have no balance left`;
                } else if (value > 0 && value < 1) {
                    this.amountErrMsg = `You can't stake amount less than 1 FTM`;
                } else if (value >= 1) {
                    this.amountErrMsg = `You can stake max ${remainingBalance} FTM`;
                }
            }

            if (ok && this.validatorInfo.delegatedLimit && this.validatorInfo.address) {
                const delegatedLimit = parseFloat(this.$fWallet.WEIToFTM(this.validatorInfo.delegatedLimit));

                if (value > delegatedLimit) {
                    this.amountErrMsg =
                        `Staking limit reached. You can stake max ${delegatedLimit} FTM on validator ` + this.validator;
                    ok = false;
                }
            }

            return ok;
        },

        /**
         * Validator for `validator` input field.
         *
         * @return {Boolean}
         */
        checkValidator() {
            return !!this.validatorInfo.address;
        },

        /**
         * Update validator info with the newest data.
         *
         * @return {Promise<void>}
         */
        async updateValidatorInfo() {
            const validatorInfo = await this.$fWallet.getStakerById(this.validatorInfo.id);

            this.validatorInfo = {
                ...this.validatorInfo,
                ...validatorInfo,
            };
        },

        /**
         * Get transaction object for staking and change view to `StakeConfirmation`.
         *
         * @param {Number} _amount Amount of FTM to stake.
         * @return {Promise<void>}
         */
        async stakeCofirmation(_amount) {
            const amount = parseFloat(_amount);
            const validatorId = parseInt(this.validatorInfo.id, 16);
            let delegationTx = null;

            if (this.increaseDelegation) {
                delegationTx = sfcUtils.increaseDelegationTx(amount, validatorId);
            } else {
                delegationTx = sfcUtils.createDelegationTx(amount, validatorId);
            }

            const tx = await this.$fWallet.getSFCTransactionToSign(
                delegationTx,
                this.currentAccount.address,
                GAS_LIMITS.delegate
            );

            this.$emit('change-component', {
                to: 'stake-confirmation',
                from: 'stake-form',
                data: {
                    amount: amount,
                    ...this.validatorInfo,
                    tx,
                    increaseDelegation: this.increaseDelegation,
                    stakerInfo: this.stakerInfo || this.validatorInfo,
                    previousComponent: this.previousComponent,
                    stakerId: this.stakerId,
                },
            });
        },

        onValidatorSelected(_validatorInfo) {
            if (!this.increaseDelegation) {
                this.validator = `${_validatorInfo.name}, ${parseInt(_validatorInfo.id, 16)}`;
                this.validatorInfo = { ..._validatorInfo };
                this.updateValidatorInfo().then(() => {
                    this.$refs.stakeForm.checkValidity();
                });
            }
        },

        onSelectValidatorClick() {
            if (!this.increaseDelegation) {
                this.$refs.validatorPickerWindow.show();
            }
        },

        onSelectValidatorKeyup(_event) {
            if (!this.increaseDelegation && isAriaAction(_event)) {
                this.$refs.validatorPickerWindow.show();
            }
        },

        onPreviousBtnClick() {
            this.$emit('change-component', {
                to: this.previousComponent,
                from: 'stake-form',
                data: {
                    stakerId: this.stakerId,
                },
            });
        },

        async onFormSubmit(_event) {
            const { data } = _event.detail;

            this.updateValidatorInfo().then(async () => {
                if ((await this.$refs.stakeForm.checkValidity()) && this.validatorInfo.address) {
                    this.stakeCofirmation(parseFloat(data.amount));
                }
            });
        },

        onEntireBalanceClick() {
            let amount = 0;

            if (this.maxRemainingBalance > 0) {
                amount = parseFloat(this.maxRemainingBalance) - 2;
            }

            this.amount = amount.toString();
        },
    },
};
</script>

<style lang="scss">
.stake-form:not(.increase-delegation) {
    .validator-select,
    .validator-select > *,
    .validator-select input {
        cursor: pointer !important;
    }
}
</style>
