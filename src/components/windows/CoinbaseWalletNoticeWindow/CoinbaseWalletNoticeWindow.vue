<template>
    <f-window
        ref="window"
        modal
        title="Notice"
        class="coinbasewalletnoticewindow double-body-padding"
        style="max-width: 560px"
        animation-in="scale-center-enter-active"
        animation-out="scale-center-leave-active"
    >
        <div v-if="!$walletlink.isCorrectChainId(walletlinkChainId)">
            Please select <b>Fantom Opera</b> network on Coinbase Wallet:
            <ol>
                <li>
                    Tap the
                    <img
                        src="https://help.coinbase.com/content/dam/help/articles/wallet/Settings%20Tab.png"
                        alt="settings icon"
                        height="18"
                    />
                    in the mobile app.
                </li>
                <li>Tap <b>Active network</b>.</li>
                <li>Select <b>Fantom Opera</b>.</li>
            </ol>
        </div>
        <div v-else-if="$walletlink.selectedAddress.toLowerCase() !== currentAccount.address.toLowerCase()">
            Please, select account <b>{{ currentAccount.address }}</b> on Coinbase Wallet
        </div>
    </f-window>
</template>

<script>
import FWindow from '@/components/core/FWindow/FWindow.vue';
import { mapGetters, mapState } from 'vuex';

export default {
    name: 'CoinbaseWalletNoticeWindow',

    components: { FWindow },

    computed: {
        ...mapGetters(['currentAccount']),

        ...mapState('walletlink', {
            walletlinkChainId: 'chainId',
        }),
    },

    watch: {
        walletlinkChainId() {
            if (this.$walletlink.isCorrectChainId()) {
                this.$refs.window.hide();
            } else {
                this.$refs.window.show();
            }
        },
    },

    methods: {
        show() {
            this.$refs.window.show();
        },
    },
};
</script>

<style scoped></style>
