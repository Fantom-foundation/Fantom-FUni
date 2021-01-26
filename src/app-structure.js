import { Tree } from './utils/tree.js';

/**
 * App structure (incomplete) used for navigation and view transitions.
 *
 * @type {WalletAppStructureNode[]}
 */
const appStructure = [
    {
        id: 'swap',
        route: 'swap',
        _c: [
            {
                id: 'funiswap-swap',
                route: 'funiswap-swap',
                _c: [
                    {
                        id: 'funiswap-swap-confirmation',
                        route: 'funiswap-swap-confirmation',
                        _c: [
                            {
                                id: 'funiswap-swap-transaction-success-message',
                                route: 'funiswap-swap-transaction-success-message',
                                _c: [
                                    {
                                        id: 'funiswap-swap-confirmation2',
                                        route: 'funiswap-swap-confirmation2',
                                        _c: [
                                            {
                                                id: 'funiswap-swap-transaction-success-message2',
                                                route: 'funiswap-swap-transaction-success-message2',
                                            },
                                            {
                                                id: 'funiswap-swap-transaction-reject-message2',
                                                route: 'funiswap-swap-transaction-reject-message2',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                id: 'funiswap-swap-transaction-reject-message',
                                route: 'funiswap-swap-transaction-reject-message',
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 'pool',
        route: 'pool',
        _c: [
            {
                id: 'funiswap-pools',
                route: 'funiswap-pools',
                _c: [
                    {
                        id: 'funiswap-add-liquidity',
                        route: 'funiswap-add-liquidity',
                        _c: [
                            {
                                id: 'funiswap-add-liquidity-confirmation',
                                route: 'funiswap-add-liquidity-confirmation',
                                _c: [
                                    {
                                        id: 'funiswap-add-liquidity-transaction-success-message',
                                        route: 'funiswap-add-liquidity-transaction-success-message',
                                        _c: [
                                            {
                                                id: 'funiswap-add-liquidity-confirmation2',
                                                route: 'funiswap-add-liquidity-confirmation2',
                                                _c: [
                                                    {
                                                        id: 'funiswap-add-liquidity-transaction-success-message2',
                                                        route: 'funiswap-add-liquidity-transaction-success-message2',
                                                        _c: [
                                                            {
                                                                id: 'funiswap-add-liquidity-confirmation3',
                                                                route: 'funiswap-add-liquidity-confirmation3',
                                                                _c: [
                                                                    {
                                                                        id:
                                                                            'funiswap-add-liquidity-transaction-success-message3',
                                                                        route:
                                                                            'funiswap-add-liquidity-transaction-success-message3',
                                                                    },
                                                                    {
                                                                        id:
                                                                            'funiswap-add-liquidity-transaction-reject-message3',
                                                                        route:
                                                                            'funiswap-add-liquidity-transaction-reject-message3',
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        id: 'funiswap-add-liquidity-transaction-reject-message2',
                                                        route: 'funiswap-add-liquidity-transaction-reject-message2',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'funiswap-add-liquidity-transaction-reject-message',
                                        route: 'funiswap-add-liquidity-transaction-reject-message',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'funiswap-remove-liquidity',
                        route: 'funiswap-remove-liquidity',
                        _c: [
                            {
                                id: 'funiswap-remove-liquidity-confirmation',
                                route: 'funiswap-remove-liquidity-confirmation',
                                _c: [
                                    {
                                        id: 'funiswap-remove-liquidity-transaction-success-message',
                                        route: 'funiswap-remove-liquidity-transaction-success-message',
                                        _c: [
                                            {
                                                id: 'funiswap-remove-liquidity-confirmation2',
                                                route: 'funiswap-remove-liquidity-confirmation2',
                                                _c: [
                                                    {
                                                        id: 'funiswap-remove-liquidity-transaction-success-message2',
                                                        route: 'funiswap-remove-liquidity-transaction-success-message2',
                                                    },
                                                    {
                                                        id: 'funiswap-remove-liquidity-transaction-reject-message2',
                                                        route: 'funiswap-remove-liquidity-transaction-reject-message2',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        id: 'funiswap-remove-liquidity-transaction-reject-message',
                                        route: 'funiswap-remove-liquidity-transaction-reject-message',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'funiswap-pair-detail',
                        route: 'funiswap-pair-detail',
                    },
                ],
            },
        ],
    },
    /*
    {
        id: 'add-liquidity',
        route: 'add-liquidity',
        _c: [
        ],
    },
    {
        id: 'remove-liquidity',
        route: 'remove-liquidity',
        _c: [
        ],
    },
    */
    {
        id: 'wrap-ftm',
        route: 'wrap-ftm',
        _c: [
            {
                id: 'funiswap-wrap-ftm',
                route: 'funiswap-wrap-ftm',
                _c: [
                    {
                        id: 'funiswap-wrap-ftm-confirmation',
                        route: 'funiswap-wrap-ftm-confirmation',
                        _c: [
                            {
                                id: 'funiswap-wrap-ftm-transaction-success-message',
                                route: 'funiswap-wrap-ftm-transaction-success-message',
                            },
                            {
                                id: 'funiswap-wrap-ftm-transaction-reject-message',
                                route: 'funiswap-wrap-ftm-transaction-reject-message',
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

/** @type {Tree} */
export const appStructureTree = new Tree(appStructure);

export function getAppParentNode(_id) {
    const node = appStructureTree.get(_id);

    return node ? node._p : null;
}

export function getAppNodeParents(_id) {
    return appStructureTree.getParents(_id);
}
