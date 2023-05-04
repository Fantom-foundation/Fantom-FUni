import { clientInfo } from '../utils/client-info.js';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import EthereumApp from '@ledgerhq/hw-app-eth';
// import { Transaction } from 'ethereumjs-tx';
import FantomNano, { FANTOM_CHAIN_ID } from 'fantom-ledgerjs/src/fantom-nano.js';
import { Transaction } from 'ethereumjs-tx';
import Common from 'ethereumjs-common';
const ethUtil = require('ethereumjs-util');

// const ethUtil = require('ethereumjs-util');

/** @type {LedgerEth} */
export let ledgerEth = null;

export class LedgerEth {
    constructor() {
        this._app = null;
        this._transport = null;
        this.useWebHID = clientInfo.browser === 'Chrome';
        this.sigOptions = -1;
    }

    static install(vue, options) {
        if (!ledgerEth) {
            ledgerEth = new LedgerEth(options);
            vue.prototype.$ledgerEth = ledgerEth;
        }
    }

    async signTransaction(tx, accountId, addressId) {
        const app = await this.getApp();

        const raw = await this._getRawTransaction(tx);
        const sig = await app.signTransaction(this._getPath(accountId, addressId), raw);

        const result = this._getTx(tx, sig);

        return ethUtil.bufferToHex(result.raw);
    }

    async getLedgerAccount(accountId = 0, addressId = 0) {
        const app = await this.getApp();
        let account = {};

        const address = await app.getAddress(this._getPath(accountId, addressId), false, false).catch(this.onError);

        account = { address: address.address, accountId, addressId, balance: 0, totalBalance: 0 };

        return account;
    }

    async getVersion() {
        const app = await this.getApp();

        await app.getAppConfiguration().catch(this.onError);

        return 1;
    }

    /**
     * @return {Promise<EthereumApp>}
     */
    async getApp() {
        if (!this._app) {
            const transport = this._transport || (await this._getTransport());
            this._app = new EthereumApp(transport);
        }

        return this._app;
    }

    async closeTransport() {
        if (this._transport) {
            await this._transport.close();
            this._transport = null;
        }
    }

    async onError(error) {
        console.error(error);
        // await this.closeTransport();
        throw new Error(error);
    }

    async _getTransport() {
        if (this.useWebHID) {
            if (!this._transport) {
                this._transport = await TransportWebHID.create();
                this._transport.setExchangeTimeout(300000);
            }
            // console.log('TransportWebHID', this._transport);
            return this._transport;
        } else {
            return await TransportU2F.create();
        }
    }

    async _getRawTransaction(tx) {
        const transport = await this._getTransport();
        let rawTx = '';

        if (transport) {
            const bridge = new FantomNano(transport);
            rawTx = bridge.getRawTransaction(tx);
        }

        return rawTx;
    }

    _getTx(tx, sig) {
        const txFinal = new Transaction(
            {
                ...tx,
                v: `0x${sig.v}`,
                r: `0x${sig.r}`,
                s: `0x${sig.s}`,
            },
            this._getTransactionSignatureOptions()
        );

        return {
            v: sig.v,
            r: sig.r,
            s: sig.s,
            tx: txFinal,
            raw: txFinal.serialize(),
        };
    }

    _getTransactionSignatureOptions() {
        // create the signature options structure if needed
        if (typeof this.sigOptions !== 'object') {
            this.sigOptions = {
                common: Common.forCustomChain(
                    'mainnet',
                    {
                        name: 'custom-network',
                        networkId: 1,
                        chainId: FANTOM_CHAIN_ID,
                    },
                    'petersburg'
                ),
            };
        }

        return this.sigOptions;
    }

    _getPath(accountId, addressId) {
        return `m/44'/60'/${accountId}'/0/${addressId}`;
    }
}
