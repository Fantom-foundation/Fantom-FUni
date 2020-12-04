<template>
    <f-message v-if="message" :type="messageType" with-icon class="ledger-message">
        {{ message }}
    </f-message>
</template>

<script>
import FMessage from '../core/FMessage/FMessage.vue';
import { U2FStatus } from '../../plugins/fantom-nano.js';

/**
 * Displayes ledger device status messages by given error object.
 */
export default {
    name: 'LedgerMessage',

    components: { FMessage },

    props: {
        /** Error object. */
        error: {
            type: Object,
            default() {
                return {};
            },
        },
    },

    data() {
        return {
            /** FMessage type. */
            messageType: 'info',
        };
    },

    computed: {
        /**
         * Get status message.
         *
         * @return {string}
         */
        message() {
            return this.getMessage(this.error);
        },
    },

    methods: {
        /**
         * Get status message by error.
         *
         * @return {string}
         */
        getMessage(_error) {
            let message = '';
            let statusCode = 0;

            if (_error) {
                if (_error.statusCode === U2FStatus.DEVICE_LOCKED) {
                    message = 'Please unlock the device';
                    this.messageType = 'info';
                    statusCode = _error.statusCode;
                } else if (_error.statusCode === U2FStatus.USER_REJECTED_REQUESTED_ACTION) {
                    message = 'User action rejected';
                    this.messageType = 'info';
                    statusCode = _error.statusCode;
                } else if (
                    _error.originalError &&
                    _error.originalError.metaData &&
                    _error.originalError.metaData.type === 'DEVICE_INELIGIBLE'
                ) {
                    message = 'Device ineligible';
                    this.messageType = 'info';
                    statusCode = U2FStatus.DEVICE_INELIGIBLE;
                } else {
                    message = _error.toString();
                    this.messageType = 'error';
                    console.error(_error);
                }
            }

            if (statusCode > 0) {
                /**
                 * Emits ledger device status code.
                 * @type {Event}
                 */
                this.$emit('ledger-status-code', statusCode);
            }

            return message;
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
