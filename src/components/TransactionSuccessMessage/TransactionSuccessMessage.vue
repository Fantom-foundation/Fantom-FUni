<template>
    <f-card class="transaction-success-message f-card-double-padding" :class="{ loading: loading }" :off="cardOff">
        <template v-if="loading">
            <h2>Verifying Transaction</h2>
            <pulse-loader color="#1969ff"></pulse-loader>
        </template>
        <template v-else>
            <h2>{{ dTitle }}</h2>

            <h3 class="break-word">
                <a :href="`${explorerUrl}${explorerTransactionPath}/${tx}`" target="_blank">
                    <f-ellipsis :text="tx" overflow="middle" />
                </a>
            </h3>

            <div v-if="transactionSuccess" class="success-icon">
                <icon data="@/assets/svg/message/check-circle.svg" width="96" height="96" aria-hidden="true" />
            </div>
            <div v-else class="error-icon">
                <icon data="@/assets/svg/message/times-circle.svg" width="96" height="96" aria-hidden="true" />
            </div>

            <div v-if="continueTo && transactionSuccess">
                <button class="btn large" @click="onContinueBtnClick">Continue</button>
            </div>
        </template>
    </f-card>
</template>

<script>
import FCard from '../core/FCard/FCard.vue';
import appConfig from '../../../app.config.js';
import FEllipsis from '../core/FEllipsis/FEllipsis.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import gql from 'graphql-tag';

export default {
    components: { FEllipsis, FCard, PulseLoader },

    props: {
        /** Transaction hash */
        tx: {
            type: String,
            default: '',
        },
        title: {
            type: String,
            default: 'Transaction sent!',
        },
        /** Name of component/route used in 'continue' button. */
        continueTo: {
            type: String,
            default: '',
        },
        /** Parameters to be passed to `continueTo`. */
        continueToParams: {
            type: Object,
            default() {
                return {};
            },
        },
        /** `continueTo` is name of route. */
        continueToIsRoute: {
            type: Boolean,
            default: false,
        },
        /** Continue to `continueTo` automatically after this number of milliseconds. */
        autoContinueToAfter: {
            type: Number,
            default: 0,
        },
        /** Don't render card */
        cardOff: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            explorerUrl: appConfig.explorerUrl,
            explorerTransactionPath: appConfig.explorerTransactionPath,
            loading: true,
            transactionSuccess: true,
            dTitle: this.title,
        };
    },

    mounted() {
        this.verifyTransaction();
    },

    created() {
        /** Timeout id. */
        this._tId = -1;
    },

    beforeDestroy() {
        if (this._tId > -1) {
            clearTimeout(this._tId);
        }
    },

    methods: {
        verifyTransaction() {
            setTimeout(() => {
                this._verifyTransaction();
            }, 400);
        },

        async _verifyTransaction() {
            const data = await this.$apollo.query({
                query: gql`
                    query TransactionByHash($hash: Hash!) {
                        transaction(hash: $hash) {
                            status
                        }
                    }
                `,
                variables: {
                    hash: this.tx,
                },
                fetchPolicy: 'network-only',
            });

            if (data.data.transaction.status === null) {
                this.verifyTransaction();
            } else {
                this.transactionSuccess = parseInt(data.data.transaction.status, 16) === 1;

                if (!this.transactionSuccess) {
                    this.dTitle = 'Transaction Error';
                }

                this.loading = false;

                if (this.autoContinueToAfter > 0) {
                    this._tId = setTimeout(() => {
                        this.onContinueBtnClick();
                    }, this.autoContinueToAfter);
                }
            }
        },

        onContinueBtnClick() {
            if (this.continueTo === 'account-history' || this.continueToIsRoute) {
                this.$router.replace({ name: this.continueTo, params: this.continueToParams });
            } else {
                this.$emit('change-component', {
                    to: this.continueTo,
                    from: 'transaction-success-message',
                    data: this.continueToParams,
                });
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
