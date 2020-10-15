<template>
    <div class="transaction-reject-message-view">
        <transaction-reject-message v-bind="params" card-off continue-to-is-route />
    </div>
</template>

<script>
import TransactionRejectMessage from '../../components/TransactionRejectMessage/TransactionRejectMessage.vue';

export default {
    name: 'TransactionRejectMessageView',

    components: { TransactionRejectMessage },

    computed: {
        params() {
            const { $route } = this;

            return $route && $route.params ? $route.params : {};
        },
    },
};
</script>
