<template>
    <div class="transaction-success-message-view">
        <transaction-success-message v-bind="params" card-off continue-to-is-route />
    </div>
</template>

<script>
import TransactionSuccessMessage from '../../components/TransactionSuccessMessage/TransactionSuccessMessage.vue';

export default {
    name: 'TransactionSuccessMessageView',

    components: { TransactionSuccessMessage },

    computed: {
        params() {
            const { $route } = this;

            return $route && $route.params ? $route.params : {};
        },
    },
};
</script>
