<template>
    <f-card class="transaction-completing f-card-double-padding" :off="receive">
        <h2>{{ title }}</h2>

        <template v-if="success">
            <p>We have added the following transaction/s to our log for your address:</p>

            <ul class="no-markers" style="margin-bottom: 16px">
                <li v-for="result in tsData.result" :key="result.uuid">
                    <b>
                        {{ result.amount }}
                        {{ $bnb.getFTMCurrencyByDirection(receive ? tsData.direction : 'OperaToOpera') }}
                    </b>
                    from
                    <b class="break-word">{{
                        receive ? tsData[$bnb.getAddressKeyByDirection(tsData.direction)] : tsData.from_opera_address
                    }}</b>
                </li>
            </ul>

            <p>
                You will receive another
                <b>
                    {{ tsData.amount || tsData.result[0].amount }}
                    {{ $bnb.getFTMCurrencyByDirection(receive ? 'OperaToOpera' : tsData.direction) }}
                </b>
                in your address
                <b> {{ tsData.address || tsData.result[0].opera_address }}</b>
            </p>

            <!--
            <h3 class="break-word">
                <a :href="`${explorerUrl}transactions/${tx}`" target="_blank">
                    {{ tsData.tx | formatHash }}
                </a>
            </h3>
-->

            <div class="success-icon">
                <icon data="@/assets/svg/message/check-circle.svg" width="96" height="96" aria-hidden="true" />
            </div>
        </template>
        <template v-else>
            <pulse-loader color="#1969ff"></pulse-loader>
        </template>
    </f-card>
</template>

<script>
import FCard from '../core/FCard/FCard.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import { eventBusMixin } from '../../mixins/event-bus.js';
import appConfig from '../../../app.config.js';

export default {
    name: 'TransactionCompleting',

    components: { FCard, PulseLoader },

    mixins: [eventBusMixin],

    props: {
        tokenSwapData: {
            type: Object,
            default() {
                return {};
            },
        },
        receive: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            title: 'Completing transaction',
            success: false,
            tsData: this.tokenSwapData,
            explorerUrl: appConfig.explorerUrl,
        };
    },

    created() {
        this._eventBus.on('fst-request-done', this.transactionCompleted);
    },

    mounted() {
        if (!this.receive) {
            this.finalizeTransaction();
        } else {
            this.transactionCompleted(this.tsData);
        }
    },

    methods: {
        async finalizeTransaction() {
            this.$bnb.pushFSTRequest(this.tsData);
        },

        /**
         * @param {FSTRequest} _request
         */
        transactionCompleted(_request) {
            const { tsData } = this;

            if (_request.direction === tsData.direction && _request.uuid === tsData.uuid) {
                this.tsData = _request;
                this.title = 'Swap request pending';
                this.success = true;
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
