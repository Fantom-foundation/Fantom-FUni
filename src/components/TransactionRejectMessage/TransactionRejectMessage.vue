<template>
    <f-card class="transaction-reject-message f-card-double-padding" :off="cardOff">
        <h2>Transaction rejected</h2>

        <div class="reject-icon">
            <icon data="@/assets/svg/message/times-circle.svg" width="96" height="96" aria-hidden="true" />
        </div>

        <div v-if="continueTo" class="continue-to">
            <button class="btn large" @click="onContinueBtnClick">Continue</button>
        </div>
    </f-card>
</template>

<script>
import FCard from '../core/FCard/FCard.vue';
export default {
    name: 'TransactionRejectMessage',

    components: { FCard },

    props: {
        /** Don't render card */
        cardOff: {
            type: Boolean,
            default: false,
        },
        /** Name of component/route used in 'continue' button. */
        continueTo: {
            type: String,
            default: '',
        },
        /** `continueTo` is name of route. */
        continueToIsRoute: {
            type: Boolean,
            default: false,
        },
    },

    methods: {
        onContinueBtnClick() {
            if (this.continueToIsRoute) {
                this.$router.replace({ name: this.continueTo });
            } else {
                this.$emit('change-component', {
                    to: this.continueTo,
                    from: 'transaction-reject-message',
                });
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
