<template>
    <div class="f-network-status not-visible">
        <f-window
            ref="popover"
            popover
            :with-header="false"
            animation-in="scale-center-enter-active"
            animation-out="scale-center-leave-active"
            class="f-network-status-window"
        >
            Network error, trying to reconnect
        </f-window>
    </div>
</template>

<script>
import FWindow from '@/components/core/FWindow/FWindow.vue';
/**
 * Requires apollo-network-status plugin.
 */
export default {
    name: 'FNetworkStatus',

    components: { FWindow },

    data() {
        return {
            status: '',
        };
    },

    created() {
        this.$apolloNetworkStatus.addCallback(this.onNetworkStatus);
    },

    beforeDestroy() {
        this.$apolloNetworkStatus.removeCallback(this.onNetworkStatus);
    },

    methods: {
        onNetworkStatus(_status) {
            // console.log('dd', _status);
            this.status = _status;

            if (_status === 'offline') {
                this.$refs.popover.show();
                document.documentElement.classList.add('offline');
            } else {
                this.$refs.popover.hide();
                document.documentElement.classList.remove('offline');
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
