<template>
    <div class="connect-wallet-window">
        <f-window
            ref="win"
            modal
            title="Connect Wallet"
            class="connect-wallet-f-window"
            animation-in="scale-center-enter-active"
            animation-out="scale-center-leave-active"
            @window-hide="$emit('window-hide', $event)"
        >
            <wallet-list @wallet-picked="onWalletPicked" />
        </f-window>

        <ledger-accounts-window ref="ledgerAccountsWindow" />
        <coinbase-wallet-notice-window v-if="showCBWindow" ref="coinbaseNoticeWindow" />
    </div>
</template>

<script>
import FWindow from '@/components/core/FWindow/FWindow.vue';
import WalletList from '@/components/WalletList/WalletList.vue';
import LedgerAccountsWindow from '../LedgerAccountsWindow/LedgerAccountsWindow.vue';
import CoinbaseWalletNoticeWindow from '@/components/windows/CoinbaseWalletNoticeWindow/CoinbaseWalletNoticeWindow.vue';

export default {
    name: 'ConnectWalletWindow',

    components: { CoinbaseWalletNoticeWindow, LedgerAccountsWindow, WalletList, FWindow },

    data() {
        return {
            showCBWindow: false,
        };
    },

    methods: {
        show() {
            this.$refs.win.show();
        },

        async onWalletPicked(_wallet) {
            const appNode = this.$root.$children[0];

            if (_wallet.code === 'metamask') {
                // root node (App.vue)
                if (!this.$metamask.isInstalled()) {
                    appNode.showMetamaskAccountPickerWindow('');
                    this.$refs.win.hide('fade-leave-active');
                    return;
                }

                try {
                    const accounts = await this.$metamask.requestAccounts();

                    if (accounts && accounts[0] && appNode) {
                        await appNode.addMetamaskAccount(accounts[0]);
                        // appNode.showMetamaskAccountPickerWindow(accounts[0]);
                    }

                    this.$refs.win.hide('fade-leave-active');
                } catch (_error) {
                    console.log('!!', _error);
                }
            } else if (_wallet.code === 'ledger') {
                this.$refs.win.hide('fade-leave-active');
                this.$refs.ledgerAccountsWindow.show();
            } else if (_wallet.code === 'coinbase') {
                try {
                    const accounts = await this.$walletlink.connect();

                    await appNode.addCoinbaseWalletAccount(accounts[0]);

                    this.$refs.win.hide('fade-leave-active');

                    if (!this.$walletlink.isCorrectChainId()) {
                        this.$refs.win.hide('fade-leave-active');
                        this.showCBWindow = true;
                        this.$nextTick(() => {
                            this.$refs.coinbaseNoticeWindow.show();
                        });
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
