<template>
    <div class="ledger-accounts-window">
        <f-window
            ref="win"
            modal
            style="max-width: 640px"
            title="Pick ledger account"
            class="double-body-padding"
            animation-in="scale-center-enter-active"
            animation-out="scale-center-leave-active"
            @window-hide="onWindowHide"
        >
            <template #controls>
                <button class="btn white-btn close-btn same-size round light" title="Close window">
                    <icon data="@/assets/svg/times.svg" width="20" height="20" />
                </button>
            </template>

            <ledger-account-picker show-try-again-button @ledger-account-picked="onLedgerAccountPicked" />
        </f-window>
    </div>
</template>

<script>
import LedgerAccountPicker from '../../LedgerAccountPicker/LedgerAccountPicker.vue';
import FWindow from '../../core/FWindow/FWindow.vue';

export default {
    name: 'LedgerAccountsWindow',

    components: { FWindow, LedgerAccountPicker },

    methods: {
        show() {
            this.$refs.win.show();
        },

        /**
         * Re-target `'window-hide'` event.
         *
         * @param {object} _data
         */
        onWindowHide(_data) {
            this.$emit('window-hide', _data);
        },

        onLedgerAccountPicked() {
            this.$refs.win.hide();
        },
    },
};
</script>
