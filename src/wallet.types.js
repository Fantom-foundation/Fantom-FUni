/**
 * Wallet's blockchain type.
 * @typedef {('fantom' | 'ethereum' | 'binance')} WalletBlockchain
 */

/**
 * Possible actions on wallet's contact
 * @typedef {('new' | 'add' | 'edit')} WalletContactAction
 */

/**
 * Account object.
 * @typedef {Object} WalletAccount
 * @property {string} address
 * @property {string} name Custom name of the wallet.
 * @property {string} balance Hex number.
 * @property {string} totalBalance Hex number.
 * @property {string} pendingRewards Hex number.
 * @property {Object} keystore Keystore file.
 * @property {boolean} isLedgerAccount
 * @property {number} accountId Ledger account id.
 * @property {number} addressId Ledger address id.
 */

/**
 * Contact object.
 * @typedef {Object} WalletContact
 * @property {string} address
 * @property {string} name
 * @property {WalletBlockchain} blockchain
 * @property {number} order Order in contact list. Index into contacts array.
 */

/**
 * Contact object.
 * @typedef {Object} WalletAppStructureNode
 * @property {string} id Unique id of node.
 * @property {string} [route] Route name (from src/routes.js).
 * @property {string} [component] Component name in kebab case.
 * @property {WalletAppStructureNode[]} _c Children.
 */
