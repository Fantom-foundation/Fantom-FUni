<template>
    <div id="app">
        <!--            <router-view :key="$route.path"></router-view>-->

        <!--        <router-view aria-live="polite"></router-view>-->
        <router-view></router-view>

        <!--
        <f-header></f-header>
        <main>
            <router-view></router-view>
        </main>
        <f-footer></f-footer>
-->

        <f-breakpoints @f-breakpoint-change="onFBreakpointChange">
            <f-breakpoint value="576px" code="small"></f-breakpoint>
            <f-breakpoint value="600px" code="data-table-mobile-view"></f-breakpoint>
            <f-breakpoint value="768px" code="menu-mobile"></f-breakpoint>
            <f-breakpoint value="769px" code="medium"></f-breakpoint>
            <f-breakpoint value="890px" code="pairs-list-mobile-view"></f-breakpoint>
            <f-breakpoint value="992px" code="large"></f-breakpoint>
        </f-breakpoints>
        <f-aria-alert />
        <f-network-status />
        <metamask-account-picker-window ref="metamaskAccountPickerWindow" :metamask-account="dMetamaskAccount" />
    </div>
</template>

<script>
import FBreakpoint from './components/core/FBreakpoints/FBreakpoint.vue';
import FBreakpoints from './components/core/FBreakpoints/FBreakpoints.vue';
import {
    SET_BREAKPOINT,
    SET_CURRENCY,
    SET_FRACTION_DIGITS,
    SET_DARK_MODE,
    SET_TOKEN_PRICE,
    SET_FUNISWAP_SLIPPAGE_TOLERANCE,
    DEACTIVATE_ACTIVE_ACCOUNT,
    SET_ACTIVE_ACCOUNT_BY_ADDRESS,
    SET_ACTIVE_ACCOUNT_ADDRESS,
} from './store/mutations.type.js';
import FAriaAlert from './components/core/FAriaAlert/FAriaAlert.vue';
import { filtersOptions } from './filters.js';
import { eventBusMixin } from './mixins/event-bus.js';
import FNetworkStatus from '@/components/core/FNetworkStatus/FNetworkStatus.vue';
import MetamaskAccountPickerWindow from '@/components/windows/MetamaskAccountPickerWindow/MetamaskAccountPickerWindow.vue';
import { mapGetters } from 'vuex';
import { ADD_METAMASK_ACCOUNT } from '@/store/actions.type.js';
import { ADD_LEDGER_ACCOUNT } from './store/actions.type.js';

export default {
    name: 'App',

    components: {
        MetamaskAccountPickerWindow,
        FNetworkStatus,
        FAriaAlert,
        FBreakpoint,
        FBreakpoints,
    },

    mixins: [eventBusMixin],

    data() {
        return {
            dMetamaskAccount: '',
        };
    },

    computed: {
        /*
        ...mapState('metamask', {
            metamaskAccount: 'account',
        }),
        */

        ...mapGetters(['getAccountByAddress']),
    },

    /*
    watch: {
        metamaskAccount(_account) {
            console.log(_account, this.getAccountByAddress(_account));
        },
    },
    */

    created() {
        // const useDarkColorScheme = window.matchMedia('(prefers-color-scheme: dark)');

        this.darkMode(this.$store.state.darkMode);
        // this.setDarkMode(false);

        // useDarkColorScheme.addEventListener('change', (_event) => this.darkMode(_event.matches));

        filtersOptions.currency = this.$store.state.currency;
        filtersOptions.fractionDigits = this.$store.state.fractionDigits;
        this.setTokenPrice(this.$store.state.currency);
    },

    methods: {
        /**
         * @param {string} _address
         * @return {?WalletAccount}
         */
        accountExists(_address) {
            return this.getAccountByAddress(_address);
        },

        async setTokenPrice(_currency = filtersOptions.currency) {
            const tokenPrice = await this.$fWallet.getTokenPrice(_currency);

            filtersOptions.tokenPrice = tokenPrice;

            this.$store.commit(SET_TOKEN_PRICE, tokenPrice);
        },

        /**
         * @param {string} _currency
         */
        async setCurrency(_currency) {
            if (_currency) {
                filtersOptions.currency = _currency;
                this.$store.commit(SET_CURRENCY, _currency);
                await this.setTokenPrice(_currency);
            }
        },

        /**
         * @param {int} _fractionDigits
         */
        setFractionDigits(_fractionDigits) {
            if (_fractionDigits) {
                filtersOptions.fractionDigits = _fractionDigits;
                this.$store.commit(SET_FRACTION_DIGITS, _fractionDigits);
            }
        },

        /**
         * @param {number} _fUniswapSlippageTolerance
         */
        setFUniswapSlippageTolerance(_fUniswapSlippageTolerance) {
            if (_fUniswapSlippageTolerance) {
                this.$store.commit(SET_FUNISWAP_SLIPPAGE_TOLERANCE, _fUniswapSlippageTolerance);
            }
        },

        /**
         * @param {boolean} _on
         */
        setDarkMode(_on) {
            this.$store.commit(SET_DARK_MODE, _on);

            this.darkMode(_on);
        },

        /**
         * @param {boolean} _on
         */
        darkMode(_on) {
            const { documentElement } = document;

            documentElement.classList.add('theme-transition');

            if (_on) {
                documentElement.classList.add('dark-theme');
            } else {
                documentElement.classList.remove('dark-theme');
            }

            setTimeout(function () {
                documentElement.classList.remove('theme-transition');
            }, 250);
        },

        async addMetamaskAccount(_address) {
            if (!this.accountExists(_address)) {
                await this.$store.dispatch(ADD_METAMASK_ACCOUNT, _address);
            }

            this.pickAccount(_address);
        },

        async addLedgerAccount(_account) {
            if (!this.accountExists(_account.address)) {
                await this.$store.dispatch(ADD_LEDGER_ACCOUNT, _account);
            }

            this.pickAccount(_account.address);
        },

        /**
         * @param {string} _address
         */
        pickAccount(_address) {
            this.$store.commit(DEACTIVATE_ACTIVE_ACCOUNT);

            if (_address) {
                this.$store.commit(SET_ACTIVE_ACCOUNT_BY_ADDRESS, _address);
                this.$store.commit(SET_ACTIVE_ACCOUNT_ADDRESS, _address);
            }
        },

        /**
         * @param {string} _account Metamask account.
         */
        showMetamaskAccountPickerWindow(_account) {
            if (_account) {
                this.dMetamaskAccount = this.$fWallet.toChecksumAddress(_account);
            }
            this.$refs.metamaskAccountPickerWindow.show();
        },

        onFBreakpointChange(_event) {
            this.$store.commit(SET_BREAKPOINT, _event.detail);
        },
    },
};
</script>

<style lang="scss">
@import './assets/scss/main';
</style>
