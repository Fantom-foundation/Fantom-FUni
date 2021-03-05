<template>
    <div class="defi-token-picker-window">
        <f-window
            ref="win"
            modal
            style="max-width: 400px"
            title="Select"
            class="account-picker-f-window"
            animation-in="scale-center-enter-active"
            animation-out="scale-center-leave-active"
            @window-hide="$emit('window-hide', $event)"
        >
            <defi-token-list :tokens="tokens" :hide-balance="hideBalance" @defi-token-picked="onDefiTokenPicked" />
        </f-window>
    </div>
</template>

<script>
import FWindow from '../../core/FWindow/FWindow.vue';
import DefiTokenList from '../../DefiTokenList/DefiTokenList.vue';

export default {
    name: 'DefiTokenPickerWindow',

    components: { DefiTokenList, FWindow },

    props: {
        /** @type {DefiToken[]} */
        tokens: {
            type: Array,
            default() {
                return [];
            },
        },
        hideBalance: {
            type: Boolean,
            default: false,
        },
    },

    methods: {
        show() {
            this.$refs.win.show();
        },

        onDefiTokenPicked(_token) {
            this.$refs.win.hide('fade-leave-active');
            this.$emit('defi-token-picked', _token);
        },
    },
};
</script>
