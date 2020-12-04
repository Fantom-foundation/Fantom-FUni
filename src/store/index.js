import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersist from 'vuex-persist';
import appConfig from '../../app.config.js';

import {
    APPEND_ACCOUNT,
    DEACTIVATE_ACTIVE_ACCOUNT,
    REMOVE_ACTIVE_ACCOUNT,
    SET_ACTIVE_ACCOUNT_ADDRESS,
    SET_ACTIVE_ACCOUNT_BY_ADDRESS,
    SET_BREAKPOINT,
    SET_TOKEN_PRICE,
    SET_ACCOUNT,
    MOVE_ACCOUNT,
    SET_CURRENCY,
    SET_FRACTION_DIGITS,
    SET_SEND_DIRECTION,
    SET_DARK_MODE,
    SET_FUNISWAP_SLIPPAGE_TOLERANCE,
} from './mutations.type.js';
import {
    ADD_ACCOUNT,
    ADD_LEDGER_ACCOUNT,
    UPDATE_ACCOUNT,
    UPDATE_ACCOUNT_BALANCE,
    UPDATE_ACCOUNTS_BALANCES,
    REMOVE_ACCOUNT_BY_ADDRESS,
    ADD_METAMASK_ACCOUNT,
} from './actions.type.js';
import { fWallet } from '../plugins/fantom-web3-wallet.js';
import { arrayEquals } from '@/utils/array.js';

Vue.use(Vuex);

const vuexPlugins = [];

const vuexLocalStorage = new VuexPersist({
    // The key to store the state on in the storage provider.
    key: 'vuex-funiswap',
    // TODO: write custom storage for chrome.storage
    storage: window.localStorage,
    // Function that passes the state and returns the state with only the Objects you want to store.
    reducer: (_state) => ({
        // tokenPrice: _state.tokenPrice,
        // currency: _state.currency,
        // fractionDigits: _state.fractionDigits,
        fUniswapSlippageTolerance: _state.fUniswapSlippageTolerance,
        darkMode: _state.darkMode,
        accounts: _state.accounts,
        activeAccountIndex: _state.activeAccountIndex,
    }),
});

vuexPlugins.push(vuexLocalStorage.plugin);

/**
 * Get pending rewards amount from account structure.
 * Pending rewards are stored because of not to query totalBalance too often.
 *
 * @param {object} _account
 * @return {string}
 */
function getPendingRewards(_account) {
    let pendingRewards = [];

    if (_account && _account.delegations && _account.delegations.edges) {
        pendingRewards = _account.delegations.edges.map((_item) =>
            _item.delegation && _item.delegation.pendingRewards ? _item.delegation.pendingRewards.amount : ''
        );
    }

    return pendingRewards;
}

export const store = new Vuex.Store({
    plugins: vuexPlugins,

    state: {
        breakpoints: {},
        fUniswapSlippageTolerance: appConfig.settings.defaultFUniswapSlippageTolerance,
        darkMode: true,
        /** @type {[WalletAccount]} */
        accounts: [],
        // index of active stored account
        activeAccountIndex: -1,
        activeAccountAddress: '',
    },

    getters: {
        /**
         * @param {Object} _state
         * @return {[WalletAccount]}
         */
        accounts(_state) {
            return _state.accounts;
        },
        /**
         * @param {Object} _state
         * @return {?WalletAccount}
         */
        currentAccount(_state) {
            return _state.activeAccountIndex > -1 ? _state.accounts[_state.activeAccountIndex] : null;
        },
        /**
         * @param {Object} _state
         * @return {number}
         */
        currentAccountAddress(_state) {
            return _state.activeAccountAddress;
        },
        /**
         * @param {Object} _state
         * @return {number}
         */
        fUniswapSlippageTolerance(_state) {
            return _state.fUniswapSlippageTolerance / 100;
        },
        /**
         * @param {Object} _state
         * @return {function(*=): ?WalletAccount}
         */
        getAccountByAddress(_state) {
            return (_address) => {
                const address = fWallet.toChecksumAddress(_address);

                return _state.accounts.find((_item) => _item.address === address);
            };
        },
        /**
         * Get account and index into `state.accounts` array by account address.
         *
         * @param _state
         * @return {function(string): {index: number, account: WalletAccount}}
         */
        getAccountAndIndexByAddress(_state) {
            return (_address) => {
                const { accounts } = _state;
                const address = fWallet.toChecksumAddress(_address);
                const ret = {
                    account: null,
                    index: -1,
                };

                for (let i = 0, len1 = accounts.length; i < len1; i++) {
                    if (accounts[i].address === address) {
                        ret.account = { ...accounts[i] };
                        ret.index = i;
                        break;
                    }
                }

                return ret;
            };
        },
    },

    mutations: {
        /**
         * @param {Object} _state
         * @param {Object} _breakpoint
         */
        [SET_BREAKPOINT](_state, _breakpoint) {
            _state.breakpoints = {
                ..._state.breakpoints,
                ...{ [_breakpoint.code]: _breakpoint },
            };
        },
        /**
         * @param {Object} _state
         * @param {number} _tokenPrice
         */
        [SET_TOKEN_PRICE](_state, _tokenPrice) {
            _state.tokenPrice = _tokenPrice;
        },
        /**
         * @param {Object} _state
         * @param {number} _currency
         */
        [SET_CURRENCY](_state, _currency) {
            _state.currency = _currency;
        },
        /**
         * @param {Object} _state
         * @param {number} _fractionDigits
         */
        [SET_FRACTION_DIGITS](_state, _fractionDigits) {
            _state.fractionDigits = _fractionDigits;
        },
        /**
         * @param {Object} _state
         * @param {number} _fUniswapSlippageTolerance
         */
        [SET_FUNISWAP_SLIPPAGE_TOLERANCE](_state, _fUniswapSlippageTolerance) {
            _state.fUniswapSlippageTolerance = _fUniswapSlippageTolerance;
        },
        /**
         * @param {Object} _state
         * @param {boolean} _on
         */
        [SET_DARK_MODE](_state, _on) {
            _state.darkMode = _on;
        },
        /**
         * @param {Object} _state
         * @param {BNBridgeDirection} _direction
         */
        [SET_SEND_DIRECTION](_state, _direction) {
            _state.sendDirection = _direction;
        },
        /**
         * @param {Object} _state
         * @param {string} _address
         */
        [SET_ACTIVE_ACCOUNT_BY_ADDRESS](_state, _address) {
            const { accounts } = _state;
            const address = fWallet.toChecksumAddress(_address);

            _state.activeAccountIndex = -1;

            for (let i = 0, len1 = accounts.length; i < len1; i++) {
                if (accounts[i].address === address) {
                    _state.activeAccountIndex = i;
                    break;
                }
            }
        },
        /**
         * @param {Object} _state
         * @param {string} _address
         */
        [SET_ACTIVE_ACCOUNT_ADDRESS](_state, _address) {
            _state.activeAccountAddress = fWallet.toChecksumAddress(_address);
        },
        /**
         * @param {Object} _state
         */
        [DEACTIVATE_ACTIVE_ACCOUNT](_state) {
            _state.activeAccountIndex = -1;
            _state.activeAccountAddress = '';
        },
        /**
         * @param {Object} _state
         * @param {WalletAccount} _account
         */
        [APPEND_ACCOUNT](_state, _account) {
            // if account is not created already
            if (!_state.accounts.find((_item) => _item.address === _account.address)) {
                _state.accounts.push(_account);
            }
        },
        /**
         * @param {Object} _state
         */
        [REMOVE_ACTIVE_ACCOUNT](_state) {
            if (_state.activeAccountIndex > -1) {
                _state.accounts.splice(_state.activeAccountIndex, 1);
                _state.activeAccountIndex = -1;
            }
        },
        /**
         * Update account by `_accountData` object. `_accountData` must contain `index` property.
         *
         * @param {Object} _state
         * @param {{index: number, ...}} _accountData
         */
        [SET_ACCOUNT](_state, _accountData) {
            const { index } = _accountData;

            if (index !== undefined && index > -1) {
                delete _accountData.index;

                Vue.set(_state.accounts, index, _accountData);
            }
        },
        /**
         * Update account by `_accountData` object. `_accountData` must contain `index` property.
         *
         * @param {Object} _state
         * @param {{from: number, to: number}} _params
         */
        [MOVE_ACCOUNT](_state, _params) {
            const { from, to } = _params;
            const accountsLen = _state.accounts.length;

            if (from !== to && from >= 0 && to >= 0 && from < accountsLen && to < accountsLen) {
                _state.accounts.splice(to, 0, _state.accounts.splice(from, 1)[0]);
            }
        },
    },

    actions: {
        /**
         * @param {Object} _context
         * @param {Object} _keystore
         */
        async [ADD_ACCOUNT](_context, _keystore) {
            const address = fWallet.toChecksumAddress(_keystore.address);
            const balance = await fWallet.getBalance(address);
            const account = {
                address,
                balance: balance.balance,
                totalBalance: balance.totalValue,
                pendingRewards: getPendingRewards(balance),
                keystore: _keystore,
                name: `Wallet ${_context.state.accounts.length + 1}`,
            };

            _context.commit(APPEND_ACCOUNT, account);
        },
        /**
         * @param {Object} _context
         * @param {WalletAccount} _account
         */
        async [ADD_LEDGER_ACCOUNT](_context, _account) {
            const address = fWallet.toChecksumAddress(_account.address);

            if (!_context.getters.getAccountByAddress(address)) {
                const balance = await fWallet.getBalance(address);
                const account = {
                    ..._account,
                    address,
                    balance: balance.balance,
                    totalBalance: balance.totalValue,
                    pendingRewards: getPendingRewards(balance),
                    isLedgerAccount: true,
                    name: `Wallet ${_context.state.accounts.length + 1}`,
                };

                _context.commit(APPEND_ACCOUNT, account);
            }
        },
        /**
         * @param {Object} _context
         * @param {string} _address
         */
        async [ADD_METAMASK_ACCOUNT](_context, _address) {
            const address = fWallet.toChecksumAddress(_address);

            if (!_context.getters.getAccountByAddress(address)) {
                const balance = await fWallet.getBalance(address);
                const account = {
                    address,
                    balance: balance.balance,
                    totalBalance: balance.totalValue,
                    pendingRewards: getPendingRewards(balance),
                    isMetamaskAccount: true,
                    name: `Wallet ${_context.state.accounts.length + 1}`,
                };

                _context.commit(APPEND_ACCOUNT, account);
            }
        },
        /**
         * @param {Object} _context
         */
        async [UPDATE_ACCOUNTS_BALANCES](_context) {
            const accounts = _context.getters.accounts;
            let balance;
            let account;
            let pendingRewards;
            // const balances = await Promise.all(accounts.map((_address) => fWallet.getBalance(_address.address)));

            for (let i = 0; i < accounts.length; i++) {
                account = accounts[i];

                balance = await fWallet.getBalance(account.address, false, true);
                pendingRewards = getPendingRewards(balance);

                if (account.balance !== balance.balance || !arrayEquals(account.pendingRewards, pendingRewards)) {
                    balance = await fWallet.getBalance(account.address);

                    _context.commit(SET_ACCOUNT, {
                        ...account,
                        balance: balance.balance,
                        totalBalance: balance.totalValue,
                        pendingRewards,
                        index: i,
                    });
                }
            }
        },
        /**
         * @param {Object} _context
         * @param {WalletAccount} [_account]
         */
        async [UPDATE_ACCOUNT_BALANCE](_context, _account) {
            const account = _account || _context.getters.currentAccount;

            if (account) {
                const { index } = _context.getters.getAccountAndIndexByAddress(account.address);
                let balance = await fWallet.getBalance(account.address, false, true);
                let pendingRewards = getPendingRewards(balance);

                if (
                    index > -1 &&
                    (account.balance !== balance.balance || !arrayEquals(account.pendingRewards, pendingRewards))
                ) {
                    balance = await fWallet.getBalance(account.address);

                    _context.commit(SET_ACCOUNT, {
                        ...account,
                        balance: balance.balance,
                        totalBalance: balance.totalValue,
                        pendingRewards,
                        index,
                    });
                }
            }
        },
        /**
         * @param {Object} _context
         * @param {Object} _accountData
         */
        [UPDATE_ACCOUNT](_context, _accountData) {
            const { account, index } = _context.getters.getAccountAndIndexByAddress(_accountData.address);

            if (account) {
                const name = _accountData.name !== account.address ? _accountData.name : '';
                const { activeAccountAddress } = _context.state; // store active account address

                _context.commit(SET_ACCOUNT, {
                    ...account,
                    name,
                    index,
                });

                if (_accountData.order - 1 !== index) {
                    _context.commit(MOVE_ACCOUNT, {
                        from: index,
                        to: _accountData.order - 1,
                    });
                }

                // order of accounts can change so set stored active account again
                _context.commit(SET_ACTIVE_ACCOUNT_BY_ADDRESS, activeAccountAddress);
            }
        },
        /**
         * @param {Object} _context
         * @param {string} _address
         * @return Promise<boolean> Current account removed?
         */
        [REMOVE_ACCOUNT_BY_ADDRESS](_context, _address) {
            const { account, index } = _context.getters.getAccountAndIndexByAddress(_address);
            const accounts = _context.getters.accounts;
            let activeAccountRemoved = false;

            if (account) {
                accounts.splice(index, 1);

                if (index === _context.state.activeAccountIndex) {
                    _context.commit(DEACTIVATE_ACTIVE_ACCOUNT);
                    activeAccountRemoved = true;
                }
            }

            return activeAccountRemoved;
        },
    },
});
