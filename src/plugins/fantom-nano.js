// Basic functions for communication with fantom nano ledger hw, using fantom-ledgerjs

import FantomNano from 'fantom-ledgerjs/src/fantom-nano.js';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
// import TransportWebUSB from '@ledgerhq/hw-transport-webusb';

const ethUtil = require('ethereumjs-util');

/** U2F status codes */
export const U2FStatus = {
    DEVICE_LOCKED: 28169,
    USER_REJECTED_REQUESTED_ACTION: 28167,
    DEVICE_INELIGIBLE: 4,
};

/** @type {FNano} */
export let fNano = null;

export class FNano {
    constructor() {
        this._transport = null;
    }

    static install(_Vue, _options) {
        if (!fNano) {
            fNano = new FNano(_options);
            _Vue.prototype.$fNano = fNano;
        }
    }

    async getVersion() {
        const transport = await this._getTransport();
        let version = {};

        if (transport) {
            transport.setExchangeTimeout(300000);

            const bridge = new FantomNano(transport);

            version = await bridge.getVersion();
        }

        return version;
    }

    async signTransaction(_tx, _accountId, _addressId) {
        console.log('signTransaction', _accountId, _accountId);

        const transport = await this._getTransport();

        if (transport) {
            transport.setExchangeTimeout(300000);

            const bridge = new FantomNano(transport);
            const result = await bridge.signTransaction(_accountId, _addressId, _tx);

            return ethUtil.bufferToHex(result.raw);
        }

        return null;
    }

    /**
     * @param {number} _accountId Zero based account identifier.
     * @param {number} _addressId Zero based address identifier.
     * @param {boolean} _confirmAddress Ask Ledger device to display the address before sending.
     * @returns {Promise<string>}
     */
    async getLedgerAccount(_accountId = 0, _addressId = 0, _confirmAddress = true) {
        const transport = await this._getTransport();
        let account = {};

        if (transport) {
            transport.setExchangeTimeout(300000);

            const bridge = new FantomNano(transport);

            try {
                const address = await bridge.getAddress(_accountId, _addressId, _confirmAddress);

                account = { address, accountId: _accountId, addressId: _addressId, balance: 0, totalBalance: 0 };
            } catch (e) {
                console.log(e);
                throw e;
            }
        }

        return account;
    }

    /**
     * @param {number} _accountId Zero based account identifier.
     * @param {number} _firstAddressId Zero based id of the first address we want to start with.
     * @param {number} _length The number of addresses we need
     * @returns {Promise<[]>}
     */
    async getLedgerAccounts(_accountId = 0, _firstAddressId = 0, _length = 4) {
        const transport = await this._getTransport();
        let accounts = [];

        if (transport) {
            transport.setExchangeTimeout(300000);

            const bridge = new FantomNano(transport);
            console.log(bridge, _accountId, _firstAddressId, _length);

            try {
                const addresses = await bridge.listAddresses(_accountId, _firstAddressId, _length);

                accounts = addresses.map((_address, index) => {
                    return { address: _address, accountId: _accountId, addressId: _firstAddressId + index, balance: 0 };
                });
            } catch (e) {
                console.log(e);
                throw e;
            }
        }

        return accounts;
    }

    async _getTransport() {
        return await TransportU2F.create();
    }

    /*
    async _getTransport() {
        let transport = this._transport;

        if (!transport) {
            transport = await TransportU2F.create();
            // transport = await TransportWebUSB.create();
        }

        return transport;
    }
    */

    /*
    async getLedgerAccounts() {
        console.log('wt?');

        const transport = await TransportU2F.create();
        const maxAccounts = 3;
        let accounts = [];
        let address;

        if (transport) {
            const bridge = new FantomNano(transport);
            // accounts = await Promise.all([...Array(5)].map((_val, _idx) => bridge.getAddress(0, _idx)));
            for (let i = 0; i < maxAccounts; i++) {
                address = await bridge.getAddress(0, i);
                accounts.push(address);
            }
        }

        return accounts;
    }
    */
}
