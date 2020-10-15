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
    </div>
</template>

<script>
import FWindow from '@/components/core/FWindow/FWindow.vue';
import WalletList from '@/components/WalletList/WalletList.vue';
import { mapGetters } from 'vuex';

export default {
    name: 'ConnectWalletWindow',

    components: { WalletList, FWindow },

    computed: {
        ...mapGetters(['getAccountByAddress']),
    },

    methods: {
        show() {
            this.$refs.win.show();
        },

        /**
         * @param _metamaskAccount
         * @return {?WalletAccount}
         */
        accountExists(_metamaskAccount) {
            return this.getAccountByAddress(_metamaskAccount);
        },

        async onWalletPicked(_wallet) {
            if (_wallet.code === 'metamask') {
                // root node (App.vue)
                const appNode = this.$root.$children[0];

                if (!this.$metamask.isInstalled()) {
                    appNode.showMetamaskAccountPickerWindow('');
                    this.$refs.win.hide('fade-leave-active');
                    return;
                }

                try {
                    const accounts = await this.$metamask.requestAccounts();

                    if (accounts && accounts[0] && appNode) {
                        if (!this.accountExists(accounts[0])) {
                            await appNode.addMetamaskAccount(accounts[0]);
                        }
                        // appNode.showMetamaskAccountPickerWindow(accounts[0]);
                    }

                    this.$refs.win.hide('fade-leave-active');
                } catch (_error) {
                    console.log('!!', _error);
                }
            } else if (_wallet.code === 'ledger') {
                this.$refs.win.hide('fade-leave-active');
                this.$refs.ledgerAccountsWindow.show();
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
