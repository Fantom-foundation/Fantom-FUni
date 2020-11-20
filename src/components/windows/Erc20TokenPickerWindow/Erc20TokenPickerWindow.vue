<template>
    <div class="erc20-token-picker-window">
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
            <erc20-token-list :tokens="tokens" @erc20-token-picked="onERC20TokenPicked" />
        </f-window>
    </div>
</template>

<script>
import FWindow from '../../core/FWindow/FWindow.vue';
import Erc20TokenList from '@/components/Erc20TokenList/Erc20TokenList.vue';

export default {
    name: 'Erc20TokenPickerWindow',

    components: { Erc20TokenList, FWindow },

    props: {
        /** @type {ERC20Token[]} */
        tokens: {
            type: Array,
            default() {
                return [];
            },
        },
    },

    methods: {
        show() {
            this.$refs.win.show();
        },

        onERC20TokenPicked(_token) {
            this.$refs.win.hide('fade-leave-active');
            this.$emit('erc20-token-picked', _token);
        },
    },
};
</script>
