<template>
    <f-card
        class="transaction-success-message f-card-double-padding"
        :class="{
            loading: loading,
            'window-mode': windowMode,
            'column-layout': windowMode && !loading,
            'column-layout--body-footer': windowMode && !loading,
        }"
        :off="cardOff"
    >
        <template v-if="loading">
            <h2>Verifying Transaction</h2>
            <pulse-loader color="#1969ff"></pulse-loader>
        </template>
        <template v-else>
            <div :class="{ 'center-v': windowMode }">
                <h2 data-focus tabindex="0">{{ dTitle }}</h2>

                <h3 class="break-word">
                    <a
                        v-if="!error"
                        :href="`${explorerUrl}${explorerTransactionPath}/${tx}`"
                        rel="noopener"
                        target="_blank"
                    >
                        <f-ellipsis :text="tx" overflow="middle" />
                    </a>
                    <f-message v-else type="error" alert>
                        {{ error }}
                    </f-message>
                </h3>

                <div v-if="transactionSuccess" class="success-icon">
                    <icon data="@/assets/svg/message/check-circle.svg" width="96" height="96" aria-hidden="true" />
                </div>
                <div v-else class="error-icon">
                    <icon data="@/assets/svg/message/times-circle.svg" width="96" height="96" aria-hidden="true" />
                </div>
            </div>

            <div v-if="(continueTo && transactionSuccess) || continueTo === 'hide-window'" class="form-buttons">
                <button class="btn large" @click="onContinueBtnClick">{{ continueButtonLabel }}</button>
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
import FMessage from '@/components/core/FMessage/FMessage.vue';
import { focusElem } from '@/utils/aria.js';
import { defer } from '@/utils';

export default {
    components: { FMessage, FEllipsis, FCard, PulseLoader },

    props: {
        /** Transaction hash */
        tx: {
            type: String,
            default: '',
        },
        title: {
            type: String,
            default: 'Success',
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
        /** */
        continueButtonLabel: {
            type: String,
            default: 'Continue',
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
        /** Component is placed in FWindow */
        windowMode: {
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
            error: '',
        };
    },

    watch: {
        loading() {
            defer(() => {
                console.log('lllloading change');
                focusElem(this.$el);
            });
        },
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
            try {
                const data = await this.$apollo.query({
                    query: gql`
                        query TransactionByHash($hash: Bytes32!) {
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

                    if (this.continueTo === 'hide-window') {
                        this.$emit('step', 1000);
                    }

                    if (this.autoContinueToAfter > 0) {
                        this._tId = setTimeout(() => {
                            this.onContinueBtnClick();
                        }, this.autoContinueToAfter);
                    }
                }
            } catch (error) {
                console.error(error);
                this.loading = false;
                this.error = error;
                this.dTitle = 'Error';
                this.transactionSuccess = false;
            }
        },

        getParams(obj) {
            let params = null;

            if (obj) {
                if (obj.params) {
                    params = obj.params;
                } else if (obj.props) {
                    params = obj.props;
                }
            }

            return params;
        },

        onContinueBtnClick() {
            const { continueToParams } = this;

            if (this.continueTo === 'account-history' || this.continueToIsRoute) {
                this.$router.replace({ name: this.continueTo, params: continueToParams });
            } else if (this.continueTo === 'hide-window') {
                this.$emit('cancel-button-click');
            } else {
                this.$emit('change-component', {
                    to: this.continueTo,
                    from: 'transaction-success-message',
                    data: continueToParams,
                });
            }

            const params = this.getParams(continueToParams);

            if (params && params.step) {
                this.$emit('step', params.step);
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
