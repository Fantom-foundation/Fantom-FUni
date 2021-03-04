<template>
    <div class="metamasksettings">
        <f-card>
            <div class="metamasksettings_body">
                <h3>Metamask</h3>
                <template v-if="isMetamaskInstalled">
                    <div class="metamasksettings_section">
                        <h4>Networks</h4>
                        <button
                            id="add_mainnet_btn"
                            class="btn large"
                            :disabled="addFantomMainnetInProgress"
                            @click="onAddChainClick('mainnet')"
                        >
                            Add Fantom Opera Mainnet
                            <pulse-loader v-if="addFantomMainnetInProgress" color="#fff"></pulse-loader>
                        </button>
                        <button
                            id="add_testnet_btn"
                            class="btn large secondary"
                            :disabled="addFantomTestnetInProgress"
                            @click="onAddChainClick('testnet')"
                        >
                            Add Fantom Testnet
                            <pulse-loader v-if="addFantomTestnetInProgress" color="#1969ff"></pulse-loader>
                        </button>
                    </div>

                    <div class="metamasksettings_section">
                        <h4>Assets</h4>
                        <button
                            id="add_asset_btn"
                            class="btn large"
                            :disabled="addAssetInProgress"
                            @click="onAddAssetClick"
                        >
                            Add Asset <pulse-loader v-if="addAssetInProgress" color="#fff"></pulse-loader>
                        </button>
                        <!--                        <button class="btn large secondary" @click="onAddOwnAssettClick">Add Your Own Asset</button>-->
                    </div>

                    <f-window
                        ref="popover"
                        popover
                        :attach-to="`#${btnId}`"
                        attach-position="auto"
                        preferred-attach-position="top"
                        :attach-margin="[4, 4, 4, 4]"
                        :with-header="false"
                        :hide-after="3800"
                        animation-in="scale-center-enter-active"
                        animation-out="scale-center-leave-active"
                        style="width: auto; max-width: 360px"
                    >
                        <slot name="popover-text">
                            {{ popoverText }}
                        </slot>
                    </f-window>

                    <defi-token-picker-window
                        ref="tokenPicker"
                        :tokens="defiTokens"
                        hide-balance
                        @window-hide="stopLoadingIndicators"
                        @defi-token-picked="onDefiTokenPicked"
                    />
                </template>
                <template v-else>
                    <button class="btn large" :disabled="installMetamaskInProgress" @click="onInstallMetamaskClick">
                        Install Metamask <pulse-loader v-if="installMetamaskInProgress" color="#fff"></pulse-loader>
                    </button>
                </template>
            </div>
        </f-card>
    </div>
</template>

<script>
import FCard from '@/components/core/FCard/FCard.vue';
import { OPERA_MAINNET, OPERA_TESTNET } from '@/plugins/metamask/metamask.js';
import FWindow from '@/components/core/FWindow/FWindow.vue';
import { mapGetters } from 'vuex';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import DefiTokenPickerWindow from '@/components/windows/DefiTokenPickerWindow/DefiTokenPickerWindow.vue';
import MetaMaskOnboarding from '@metamask/onboarding';

export default {
    name: 'MetamaskSettings',

    components: { DefiTokenPickerWindow, FWindow, FCard, PulseLoader },

    data() {
        return {
            isMetamaskInstalled: false,
            popoverText: '',
            btnId: '',
            addFantomMainnetInProgress: false,
            addFantomTestnetInProgress: false,
            addAssetInProgress: false,
            installMetamaskInProgress: false,
            defiTokens: [],
            requestPendingMessage: 'Request already pending',
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),
    },

    created() {
        this._intervalId = -1;
        /** @type {MetaMaskOnboarding} */
        this._onboarding = null;

        this.setInterval();
    },

    beforeDestroy() {
        this.clearInterval();
        this._onboarding = null;
    },

    methods: {
        showPopover(_text, _btnId) {
            const ePopover = this.$refs.popover;

            if (ePopover) {
                this.popoverText = _text;
                this.btnId = _btnId;
                ePopover.show();
            }
        },

        stopLoadingIndicators() {
            this.addFantomMainnetInProgress = false;
            this.addFantomTestnetInProgress = false;
            this.addAssetInProgress = false;
            this.installMetamaskInProgress = false;
        },

        setInterval(_interval = 30) {
            this.clearInterval();

            this._intervalId = setInterval(() => {
                if (this.$metamask._initialized) {
                    this.isMetamaskInstalled = this.$metamask.isInstalled();
                    this.clearInterval();
                }
            }, _interval);
        },

        clearInterval() {
            if (this._intervalId > -1) {
                clearInterval(this._intervalId);
                this._intervalId = -1;
            }
        },

        /**
         * @param {('mainnet' | 'testnet')} _type
         * @return {Promise<void>}
         */
        async onAddChainClick(_type = 'mainnet') {
            const mainnet = _type === 'mainnet';
            const chain = mainnet ? OPERA_MAINNET : OPERA_TESTNET;
            const btnId = mainnet ? 'add_mainnet_btn' : 'add_testnet_btn';

            if (mainnet) {
                this.addFantomMainnetInProgress = true;
            } else {
                this.addFantomTestnetInProgress = true;
            }

            try {
                const response = await this.$metamask.addEthereumChain(chain);

                if (response === null) {
                    this.showPopover(`${chain.chainName} was added to Metamask`, btnId);
                }

                this.stopLoadingIndicators();
            } catch (_error) {
                if (_error.code !== -32002) {
                    this.stopLoadingIndicators();
                } else {
                    this.showPopover(this.requestPendingMessage, btnId);
                }

                console.error(_error);
            }
        },

        async onAddAssetClick() {
            const accountAddress = this.currentAccount ? this.currentAccount.address : '';
            this.defiTokens =
                this.defiTokens.length > 0 ? this.defiTokens : await this.$defi.fetchTokens(accountAddress);
            this.addAssetInProgress = true;
            this.$refs.tokenPicker.show();
        },

        async onDefiTokenPicked(_token) {
            const btnId = 'add_asset_btn';

            try {
                const response = await this.$metamask.watchAsset({
                    type: 'ERC20',
                    options: {
                        address: _token.address,
                        symbol: _token.symbol,
                        decimals: _token.decimals,
                        image: _token.logoUrl,
                    },
                });

                if (response) {
                    this.showPopover(`Asset ${_token.symbol} was added to Metamask`, btnId);
                }

                this.stopLoadingIndicators();
            } catch (_error) {
                if (_error.code !== -32002) {
                    this.stopLoadingIndicators();
                } else {
                    this.showPopover(this.requestPendingMessage, btnId);
                }
                console.error(_error);
            }
        },

        onAddOwnAssettClick() {
            alert('Not implemented yet');
        },

        onInstallMetamaskClick() {
            this.installMetamaskInProgress = true;
            this._onboarding = new MetaMaskOnboarding();
            this._onboarding.startOnboarding();
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
