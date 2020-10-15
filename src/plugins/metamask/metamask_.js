import detectEthereumProvider from '@metamask/detect-provider';
import appConfig from '../../../app.config.js';
import Web3 from 'web3';
import { store } from '@/store';
import { SET_ACCOUNT, SET_CHAIN_ID } from '@/plugins/metamask/store.js';

import { Transaction } from 'ethereumjs-tx';
import Common from 'ethereumjs-common';
const ethUtil = require('ethereumjs-util');

const OPERA_CHAIN_ID = appConfig.chainId;

/** @type {Metamask} */
export let metamask = null;

/**
 * Plugin for communication with Metamask.
 */
export class Metamask {
    /**
     * @param {Vue} _Vue
     */
    static install(_Vue) {
        if (!metamask) {
            metamask = new Metamask();
            _Vue.prototype.$metamask = metamask;
        }
    }

    constructor() {
        /**
         * Metamask provider.
         *
         * @type {null}
         * @private
         */
        this._provider = null;
        /** Signals, if Metamask is installed. */
        this._installed = false;
        this._initialized = false;
        this._web3 = null;

        this.init();
    }

    async init() {
        if (!this._initialized) {
            this._initialized = true;

            await this._detectProvider();

            const provider = this._provider;

            if (provider) {
                this._web3 = new Web3(provider);

                provider.autoRefreshOnNetworkChange = false;
                provider.on('chainChanged', (_chainId) => {
                    this._onChainChange(_chainId);
                });
                provider.on('accountsChanged', (_account) => {
                    this._onAccountsChange(_account);
                });

                this._setChainId(provider.chainId);
                this._setAccount(await this.getAccounts());
            }
        }
    }

    /**
     * Signals, if Metamask is installed.
     *
     * @return {boolean}
     */
    isInstalled() {
        return this._installed;
    }

    /**
     * @return {boolean}
     */
    isCorrectChainId() {
        return this._provider && this._provider.chainId === OPERA_CHAIN_ID;
    }

    /**
     * @return {Promise<[]>}
     */
    async getAccounts() {
        let accounts = [];

        if (this._provider) {
            try {
                accounts = await this._provider.request({ method: 'eth_accounts' });
            } catch (_error) {
                console.error(_error);
            }
        }

        return accounts;
    }

    async requestAccounts() {
        if (this._provider) {
            try {
                return await this._provider.request({ method: 'eth_requestAccounts' });
            } catch (_error) {
                // userRejectedRequest error
                if (_error.code === 4001) {
                    // EIP-1193 userRejectedRequest error
                    // If this happens, the user rejected the connection request.
                    console.log('Please connect to MetaMask.');
                } else {
                    console.error(_error);
                }
            }
        }
    }

    async signTransaction(_tx, _address) {
        const typedData = this._getTransactionTypedData();

        typedData.message = _tx;

        console.log(typedData);

        if (this._provider) {
            try {
                // const sTx = await this._provider.request({ method: 'eth_signTransaction', params: [_tx] });
                const sTx = await this._provider.request({
                    method: 'eth_signTypedData_v4',
                    params: [_address, JSON.stringify(typedData)],
                    from: _address,
                });
                const signature = sTx.substring(2);

                console.log('address', _address);

                const r = '0x' + signature.substring(0, 64);
                const s = '0x' + signature.substring(64, 128);
                const v = parseInt(signature.substring(128, 130), 16);

                console.log({ r }, { s }, { v });

                const tx = new Transaction(
                    { ..._tx, r, s, v },
                    {
                        common: Common.forCustomChain(
                            'mainnet',
                            {
                                name: 'custom-network',
                                networkId: 1,
                                chainId: OPERA_CHAIN_ID,
                            },
                            'petersburg'
                        ),
                    }
                );

                // console.log('tx', tx.verifySignature(), tx);

                return ethUtil.bufferToHex(tx.serialize());
            } catch (_error) {
                console.error(_error);
            }
        }
    }

    /**
     * @return {{types: {Transaction: ({name: string, type: string}|{name: string, type: string}|{name: string, type: string}|{name: string, type: string}|{name: string, type: string})[], EIP712Domain: [{name: string, type: string}, {name: string, type: string}, {name: string, type: string}]}, primaryType: string, domain: {chainId: string, name: string, version: string}}}
     * @private
     */
    _getTransactionTypedData() {
        return {
            types: {
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                    { name: 'chainId', type: 'uint256' },
                    // { name: 'verifyingContract', type: 'address' },
                ],
                Transaction: [
                    { name: 'chainId', type: 'uint64' },
                    { name: 'data', type: 'bytes' },
                    { name: 'gas', type: 'uint256' },
                    { name: 'gasLimit', type: 'uint256' },
                    { name: 'gasPrice', type: 'uint256' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'to', type: 'address' },
                    { name: 'value', type: 'uint256' },
                    // { name: 'memo', type: 'string' },
                ],
            },
            primaryType: 'Transaction',
            domain: {
                name: 'Fantom PWA Wallet',
                version: '1',
                chainId: OPERA_CHAIN_ID,
            },
        };
    }

    /**
     * @param {string} _chainId Hex number.
     * @private
     */
    _setChainId(_chainId) {
        store.commit(`metamask/${SET_CHAIN_ID}`, _chainId);
    }

    /**
     * @param {string} _account
     * @private
     */
    _setAccount(_account) {
        store.commit(`metamask/${SET_ACCOUNT}`, _account[0] || '');
    }

    /**
     * Called on chainId change.
     *
     * @param {string} _chainId Hex number.
     * @private
     */
    _onChainChange(_chainId) {
        this._setChainId(_chainId);
    }

    /**
     * Called on account change.
     *
     * @param {string} _account
     * @private
     */
    _onAccountsChange(_account) {
        this._setAccount(_account);
    }

    /**
     * Detect the MetaMask Ethereum provider.
     *
     * @private
     */
    async _detectProvider() {
        const provider = await detectEthereumProvider();

        if (provider) {
            if (provider === window.ethereum) {
                this._provider = provider;
                this._installed = true;
            } else {
                console.error('Do you have multiple wallets installed?');
            }
        }
    }
}
