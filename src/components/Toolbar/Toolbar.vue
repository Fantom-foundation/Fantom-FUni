<template>
    <div class="toolbar">
        <ul class="no-markers toolbar__items-wrap">
            <li>
                <button class="btn secondary" @click="onConnectWalletBtnClick">
                    <template v-if="!accountAddress">Connect to a wallet</template>
                    <template v-else-if="badMetamaskChainId && !isLedgerAccount">Wrong network</template>
                    <template v-else>
                        <!--<account-name :account="currentAccount" :hide-name="true" class="toolbar__address" />-->
                        <f-ellipsis
                            :text="accountAddress"
                            overflow="middle"
                            :fixed-chars-count="4"
                            class="toolbar__address"
                        />
                        <!--{{ formatAddress(accountAddress) }}-->
                    </template>
                </button>
            </li>
            <li>
                <button
                    id="settings-btn"
                    class="btn light same-size"
                    title="Settings"
                    aria-label="Settings"
                    @click="onSettingsBtnClick"
                >
                    <icon data="@/assets/svg/settings.svg" width="20" height="20" aria-hidden="true" />
                </button>
            </li>
            <li>
                <button class="btn light same-size" title="Links" aria-label="Links" @click="onLinksBtnClick">
                    <icon data="@/assets/svg/ellipsis-v.svg" width="20" height="20" dir="right" aria-hidden="true" />
                </button>
            </li>
        </ul>

        <connect-wallet-window ref="connectWalletWindow" />

        <f-window
            ref="settingsWindow"
            :popover="true"
            hide-on-window-mousedown
            :with-header="false"
            :attach-to="`#settings-btn`"
            attach-position="auto"
            preferred-attach-position="bottom"
            title="Settings"
            :attach-margin="[4, 4, 4, 4]"
            style="max-width: 420px"
            class="light"
            animation-in="scale-center-enter-active"
            animation-out="scale-center-leave-active"
        >
            <settings />
        </f-window>

        <f-window
            ref="linksWindow"
            :popover="true"
            hide-on-window-mousedown
            :with-header="false"
            :attach-to="`#settings-btn`"
            attach-position="auto"
            preferred-attach-position="bottom"
            title="Links"
            :attach-margin="[4, 4, 4, 4]"
            style="width: auto; min-width: 200px; max-width: 360px"
            class="light"
            animation-in="scale-center-enter-active"
            animation-out="scale-center-leave-active"
        >
            <links />
        </f-window>
    </div>
</template>

<script>
import ConnectWalletWindow from '@/components/windows/ConnectWalletWindow/ConnectWalletWindow.vue';
import { mapGetters, mapState } from 'vuex';
import FEllipsis from '@/components/core/FEllipsis/FEllipsis.vue';
import FWindow from '@/components/core/FWindow/FWindow.vue';
import Settings from '@/components/Settings/Settings.vue';
import Links from '@/components/Links/Links.vue';

export default {
    name: 'Toolbar',

    components: { Links, Settings, FWindow, FEllipsis, ConnectWalletWindow },

    data() {
        return {
            badMetamaskChainId: false,
        };
    },

    computed: {
        ...mapState('metamask', {
            metamaskAccount: 'account',
            metamaskChainId: 'chainId',
        }),

        ...mapGetters(['currentAccount', 'getAccountByAddress']),

        accountAddress() {
            return this.currentAccount ? this.currentAccount.address : '';
        },

        isLedgerAccount() {
            console.log('isLedgerAccount', this.currentAccount);
            return this.currentAccount && this.currentAccount.isLedgerAccount;
        },
    },

    watch: {
        metamaskAccount(_account) {
            // root node (App.vue)
            const appNode = this.$root.$children[0];

            if (!appNode) {
                return;
            }

            if (_account) {
                if (this.currentAccount && this.currentAccount.isMetamaskAccount) {
                    if (this.accountExists(_account)) {
                        appNode.pickAccount(_account);
                    } else {
                        appNode.addMetamaskAccount(_account);
                    }
                }
            } else {
                appNode.pickAccount('');
            }
        },

        metamaskChainId(_chainId) {
            this.badMetamaskChainId = !this.$metamask.isCorrectChainId(_chainId);
        },
    },

    methods: {
        /**
         * @param {string} _account
         * @return {?WalletAccount}
         */
        accountExists(_account) {
            return this.getAccountByAddress(_account);
        },

        /**
         * @param {string} _address
         * @return {string}
         */
        formatAddress(_address) {
            return _address;
        },

        onConnectWalletBtnClick() {
            this.$refs.connectWalletWindow.show();
        },

        onSettingsBtnClick() {
            this.$refs.settingsWindow.show();
        },

        onLinksBtnClick() {
            this.$refs.linksWindow.show();
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
