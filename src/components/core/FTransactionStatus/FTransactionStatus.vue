<template>
    <div class="f-transaction-status" :class="cStatus">
        {{ $t(cStatus) }}
    </div>
</template>

<script>
/**
 * Component for displaying transaction status.
 */
export default {
    props: {
        /**
         * 0 - error
         * 1 - success
         * 2 - pending
         */
        status: {
            type: Number,
            default: 1,
        },
    },

    computed: {
        /**
         * String representation of status.
         *
         * @return {'success' | 'error' | 'pending'}
         */
        cStatus() {
            let status = 'pending';

            switch (this.status) {
                case 0:
                    status = 'error';
                    break;
                case 1:
                    status = 'success';
                    break;
            }

            return status;
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
