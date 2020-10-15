<template>
    <f-window
        ref="win"
        modal
        title="Add Metamask Account"
        style="max-width: 560px"
        animation-in="scale-center-enter-active"
        animation-out="scale-center-leave-active"
        @window-hide="$emit('window-hide', $event)"
    >
        <metamask-account-picker
            :metamask-account="metamaskAccount"
            @metamask-account-picker-cancel="onMetamaskAccountPickerCancel"
            @metamask-account-added="onMetamaskAccountAdded"
        />
    </f-window>
</template>

<script>
import FWindow from '@/components/core/FWindow/FWindow.vue';
import MetamaskAccountPicker from '@/components/MetamaskAccountPicker/MetamaskAccountPicker.vue';

export default {
    name: 'MetamaskAccountPickerWindow',

    components: { MetamaskAccountPicker, FWindow },

    props: {
        metamaskAccount: {
            type: String,
            default: '',
        },
    },

    methods: {
        show() {
            this.$refs.win.show();
        },

        onMetamaskAccountPickerCancel() {
            this.$refs.win.hide();
        },

        onMetamaskAccountAdded() {
            this.$refs.win.hide();
        },
    },
};
</script>
