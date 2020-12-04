<template>
    <div class="ledger-account-picker">
        <div v-if="showLedgerConnectMessage" class="ledger-connect-message">
            Please connect your ledger device and select Fantom FTM app.
            <div v-if="showTryAgainButton" class="button-footer">
                <button class="btn large" @click="onTryAgainBtnClick">Try again</button>
            </div>
        </div>
        <div v-if="accounts && accounts.length > 0">
            <ul class="no-markers ledger-accounts-list" @click="onLedgerAccountListClick">
                <li v-for="account in accounts" :key="account.address">
                    <div class="row no-collapse">
                        <h3 class="col-10 break-word">
                            <a href="#" class="break-word" aria-label="Address" :data-address="account.address">
                                {{ account.address }}
                            </a>
                        </h3>
                        <div class="col">{{ toFTM(account.balance) }} FTM</div>
                    </div>
                </li>
            </ul>

            <div v-if="!loadingAccounts" class="button-footer">
                <button class="btn secondary large" @click="onLoadNextBtnClick">Load Next 5</button>
            </div>
        </div>
        <div v-if="loadingAccounts" class="loader">
            <pulse-loader color="#1969ff"></pulse-loader>
        </div>
        <!--
        <f-message v-if="$asyncComputed.accounts.error" type="error" with-icon>
            An error
        </f-message>
        -->
        <f-message v-if="tmpError" type="error" with-icon>
            {{ tmpError }}
        </f-message>
    </div>
</template>

<script>
import FMessage from '../core/FMessage/FMessage.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import { toFTM } from '../../utils/transactions.js';

export default {
    components: { FMessage, PulseLoader },

    props: {
        /**  */
        maxAddressCount: {
            type: Number,
            default: 5,
        },
        /**  */
        showTryAgainButton: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            tmpError: '',
            showLedgerConnectMessage: false,
            accounts: [],
            loadingAccounts: false,
            lastAddressIdx: 0,
        };
    },

    mounted() {
        this.loadAccounts();
    },

    methods: {
        async loadAccounts(_accountId = 0, _addressId = 0, _length = this.maxAddressCount) {
            try {
                this.loadingAccounts = true;

                await this.waitForDevice();

                this.showLedgerConnectMessage = false;

                for (let i = _addressId; i < _addressId + _length; i++) {
                    await this.appendLedgerAccount(_accountId, i);
                    this.lastAddressIdx += 1;
                }

                this.loadingAccounts = false;
            } catch (e) {
                this.accounts = [];
            }
        },

        async waitForDevice() {
            try {
                await this.$fNano.getVersion();
            } catch (_error) {
                console.error(_error);
                this.showLedgerConnectMessage = true;
                this.loadingAccounts = false;

                if (_error.id !== 'U2FNotSupported' && !this.showTryAgainButton) {
                    await this.waitForDevice();
                }

                throw _error;
            }
        },

        async appendLedgerAccount(_accountId = 0, _addressId = 0) {
            const account = await this.$fNano.getLedgerAccount(_accountId, _addressId, false);
            const balance = await this.$fWallet.getBalance(account.address);

            account.balance = balance.balance;
            account.totalBalance = balance.totalBalance;

            this.accounts.push(account);
        },

        getLedgerAccountByAddress(_address) {
            const address = _address.toLowerCase();

            return this.accounts.find((_item) => _item.address.toLowerCase() === address);
        },

        onLoadNextBtnClick() {
            this.loadAccounts(0, this.lastAddressIdx);
        },

        onTryAgainBtnClick() {
            this.loadAccounts();
        },

        async onLedgerAccountListClick(_event) {
            const elem = _event.target.closest('[data-address]');
            const address = elem ? elem.getAttribute('data-address') : '';
            const account = address ? this.getLedgerAccountByAddress(address) : null;
            // root node (App.vue)
            const appNode = this.$root.$children[0];

            if (account) {
                _event.preventDefault();

                appNode.addLedgerAccount(account);

                this.$emit('ledger-account-picked');
            }
        },

        toFTM,
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
