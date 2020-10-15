<template>
    <f-window
        ref="qrWindow"
        modal
        title="Address"
        style="max-width: 620px"
        animation-in="scale-center-enter-active"
        animation-out="scale-center-leave-active"
        @window-hide="onWindowHide"
    >
        <h3 class="break-word h2 align-center">{{ address }}</h3>
        <vue-q-r-code-component :text="address" class="qr-code" />
        <slot></slot>
    </f-window>
</template>

<script>
import FWindow from '../../core/FWindow/FWindow.vue';
import VueQRCodeComponent from 'vue-qrcode-component';

export default {
    name: 'QRCodeWindow',

    components: { FWindow, VueQRCodeComponent },

    props: {
        address: {
            type: String,
            default: '',
            required: true,
        },
    },

    methods: {
        show() {
            this.$refs.qrWindow.show();
        },

        /**
         * Re-target `'window-hide'` event.
         *
         * @param {object} _data
         */
        onWindowHide(_data) {
            this.$emit('window-hide', _data);
        },
    },
};
</script>
