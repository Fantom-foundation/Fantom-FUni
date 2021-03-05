<template>
    <div class="wallet-list">
        <ul class="no-markers" @click="onWalletListClick" @keyup="onWalletListKeyup">
            <li v-for="wallet in wallets" :key="wallet.code" :data-wallet-code="wallet.code" tabindex="0">
                <div class="row align-items-center no-collapse">
                    <div class="col">{{ wallet.name }}</div>
                    <div class="col-4 align-right">
                        <icon
                            v-if="wallet.icon && !wallet.loading"
                            :data="wallet.icon"
                            width="32"
                            height="32"
                            :original="wallet.iconOriginal || false"
                            :fill="wallet.iconFill || false"
                        />
                        <div v-else class="loader">
                            <pulse-loader color="#1969ff"></pulse-loader>
                        </div>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import { cloneObject } from '@/utils';
import { isAriaAction } from '@/utils/aria.js';
import metamaskIcon from '../../assets/svg/metamask.svg';
import ledgerIcon from '../../assets/svg/ledger-logo-icon.svg';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

/**
 * List of wallets to connect to.
 */
export default {
    name: 'WalletList',

    components: { PulseLoader },

    data() {
        return {
            wallets: [
                {
                    code: 'metamask',
                    name: 'Metamask',
                    icon: metamaskIcon,
                    iconOriginal: true,
                    showLoading: true,
                },
                {
                    code: 'ledger',
                    name: 'Ledger',
                    icon: ledgerIcon,
                    iconFill: true,
                },
            ],
        };
    },

    methods: {
        /**
         * @param {Event} _event
         */
        onWalletListClick(_event) {
            const elem = _event.target.closest('[data-wallet-code]');
            const code = elem ? elem.getAttribute('data-wallet-code') : '';
            const wallet = code ? this.wallets.find((_item) => _item.code === code) : null;

            if (wallet) {
                if (wallet.showLoading) {
                    this.$set(wallet, 'loading', true);
                }

                this.$emit('wallet-picked', cloneObject(wallet));
            }
        },

        /**
         * @param {KeyboardEvent} _event
         */
        onWalletListKeyup(_event) {
            if (isAriaAction(_event)) {
                this.onWalletListClick(_event);
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
