<template>
    <div class="advancedtxfunctions">
        <details>
            <summary>Advanced Functions</summary>
            <div>
                <!--
                {{ gasInfo }} <br />
                -->
                <div class="advancedtxfunctions_inputs">
                    <f-input
                        v-model="gasPrice"
                        label="Gas Price (GWEI)"
                        type="number"
                        field-size="large"
                        autocomplete="off"
                        min="0"
                        step="any"
                    >
                        <!--                    <template #top="sProps">
                            <div class="input-label-layout">
                                <label :for="sProps.inputId">{{ sProps.label }}</label>
                                <f-info window-closeable window-class="light" style="margin-inline-start: 8px;">
                                    Gas price specifies the amount of GWEI you are willing to pay for each unit of gas
                                </f-info>
                            </div>
                        </template>-->
                    </f-input>
                    <f-input
                        v-model="gasLimit"
                        label="Gas Limit"
                        type="number"
                        field-size="large"
                        autocomplete="off"
                        min="0"
                        step="any"
                    >
                        <!--                    <template #top="sProps">
                            <div class="input-label-layout">
                                <label :for="sProps.inputId">{{ sProps.label }}</label>
                                <f-info window-closeable window-class="light" style="margin-inline-start: 8px;">
                                    Gas limit is the maximum amount of units of gas you are willing to spend.
                                </f-info>
                            </div>
                        </template>-->
                    </f-input>
                </div>
            </div>
        </details>
    </div>
</template>

<script>
import { bShiftDP, toBigNumber, toHex } from '@/utils/big-number.js';
import FInput from '@/components/core/FInput/FInput.vue';

export default {
    name: 'AdvancedTxFunctions',
    components: { FInput },
    props: {
        gasInfo: {
            type: Object,
            default() {
                return {
                    gasLimit: '',
                    gasPrice: '',
                };
            },
        },
    },

    data() {
        return {
            gasLimit: '',
            gasPrice: '',
        };
    },

    watch: {
        gasInfo: {
            handler(value) {
                if (value.gasLimit) {
                    this.gasLimit = this.gasLimitToNum(value.gasLimit);
                }

                if (value.gasPrice) {
                    this.gasPrice = this.gasPriceToNum(value.gasPrice);
                }
            },
            immediate: true,
        },
    },

    methods: {
        gasLimitToNum() {
            return toBigNumber(this.gasInfo.gasLimit).toNumber();
        },

        gasPriceToNum() {
            return bShiftDP(this.gasInfo.gasPrice, -9).toNumber();
        },

        getGasInfo() {
            const { gasInfo } = this;
            const gasLimit = toHex(this.gasLimit);
            const gasPrice = toHex(bShiftDP(this.gasPrice, 9));
            let rGasInfo = {};

            if (gasInfo.gasLimit !== gasLimit || gasInfo.gasPrice !== gasPrice) {
                rGasInfo = { gasLimit, gasPrice };
            }

            return rGasInfo;
        },
    },
};
</script>

<style lang="scss">
@use "style";
</style>
