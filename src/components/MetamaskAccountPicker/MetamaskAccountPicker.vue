<template>
    <div class="metamask-account-picker">
        <div v-if="!$metamask.isInstalled()" class="metamask-not-installed">Metamask is not installed.</div>
        <template v-else>
            <div v-if="!accountExists">
                Would you like to add account <b>{{ dMetamaskAccount }}</b> ?
            </div>
            <div v-else>
                Account <b>{{ dMetamaskAccount }}</b> is already in your wallet list. Please, select another one.
            </div>
        </template>

        <div v-if="$metamask.isInstalled()" class="form-buttons">
            <button v-show="!accountExists" class="btn large" @click="onAddAccountClick">Add Account</button>
            <button v-show="accountExists" class="btn large" @click="onOkClick">Ok</button>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { ADD_METAMASK_ACCOUNT } from '@/store/actions.type.js';

export default {
    name: 'MetamaskAccountPicker',

    props: {
        metamaskAccount: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            dMetamaskAccount: '',
        };
    },

    computed: {
        ...mapState('metamask', ['account']),

        ...mapGetters(['getAccountByAddress']),

        accountExists() {
            return this.getAccountByAddress(this.dMetamaskAccount) && !this._closing;
        },
    },

    watch: {
        account(_account) {
            if (!this._closing) {
                if (_account) {
                    this.dMetamaskAccount = this.$fWallet.toChecksumAddress(_account);
                } else {
                    this.$emit('metamask-account-picker-cancel');
                }
            }
        },
    },

    created() {
        /** Helper. */
        this._closing = false;

        if (this.metamaskAccount) {
            this.dMetamaskAccount = this.$fWallet.toChecksumAddress(this.metamaskAccount);
        }
    },

    methods: {
        async onAddAccountClick() {
            this._closing = true;

            await this.$store.dispatch(ADD_METAMASK_ACCOUNT, this.dMetamaskAccount);
            this.$router.push({ name: 'account-history', params: { address: this.dMetamaskAccount } });
            this.$emit('metamask-account-added');
        },

        onOkClick() {
            this.$emit('metamask-account-picker-cancel');
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
