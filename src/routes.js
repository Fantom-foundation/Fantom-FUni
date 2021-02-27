import NotFound from '@/views/NotFound/NotFound.vue';
import Home from '@/views/Home/Home.vue';
import AddLiquidity from '@/views/AddLiquidity/AddLiquidity.vue';
import RemoveLiquidity from '@/views/RemoveLiquidity/RemoveLiquidity.vue';
import Swap from '@/views/Swap/Swap.vue';
import FUniswapSwap from '@/components/FUniswapSwap/FUniswapSwap.vue';
import FUniswapAddLiquidity from '@/components/FUniswapAddLiquidity/FUniswapAddLiquidity.vue';
import FUniswapRemoveLiquidity from '@/components/FUniswapRemoveLiquidity/FUniswapRemoveLiquidity.vue';
import FUniswapSwapConfirmation from '@/views/FUniswapSwapConfirmation/FUniswapSwapConfirmation.vue';
import FUniswapAddLiquidityConfirmation from '@/views/FUniswapAddLiquidityConfirmation/FUniswapAddLiquidityConfirmation.vue';
import FUniswapRemoveLiquidityConfirmation from '@/views/FUniswapRemoveLiquidityConfirmation/FUniswapRemoveLiquidityConfirmation.vue';
import TransactionSuccessMessageView from '@/views/TransactionSuccessMessageView/TransactionSuccessMessageView.vue';
import TransactionRejectMessageView from '@/views/TransactionRejectMessageView/TransactionRejectMessageView.vue';
import WrapFTM from '@/views/WrapFTM/WrapFTM.vue';
import FUniswapWrapFTM from '@/components/FUniswapWrapFTM/FUniswapWrapFTM.vue';
import FUniswapWrapFTMConfirmation from '@/views/FUniswapWrapFTMConfirmation/FUniswapWrapFTMConfirmation.vue';
import Pool from '@/views/Pool/Pool.vue';
import FUniswapPool from '@/components/FUniswapPool/FUniswapPool.vue';
import FUniswapPairDetail from './components/FUniswapPairDetail/FUniswapPairDetail.vue';

export const routes = [
    {
        name: 'home',
        path: '/',
        component: Home,
        redirect: { name: 'funiswap-swap' },
        children: [
            {
                name: 'swap',
                path: '/swap/:tokena?/:tokenb?',
                component: Swap,
                children: [
                    {
                        name: 'funiswap-swap',
                        path: '',
                        component: FUniswapSwap,
                    },
                    {
                        name: 'funiswap-swap-confirmation',
                        path: 'confirmation',
                        component: FUniswapSwapConfirmation,
                    },
                    {
                        name: 'funiswap-swap-confirmation2',
                        path: 'confirmation2',
                        component: FUniswapSwapConfirmation,
                    },
                    {
                        name: 'funiswap-swap-transaction-success-message',
                        path: 'confirmation/success',
                        component: TransactionSuccessMessageView,
                    },
                    {
                        name: 'funiswap-swap-transaction-success-message2',
                        path: 'confirmation2/success2',
                        component: TransactionSuccessMessageView,
                    },
                    {
                        name: 'funiswap-swap-transaction-reject-message',
                        path: 'confirmation/reject',
                        component: TransactionRejectMessageView,
                    },
                    {
                        name: 'funiswap-swap-transaction-reject-message2',
                        path: 'confirmation2/reject2',
                        component: TransactionRejectMessageView,
                    },
                ],
            },
            {
                name: 'pool',
                path: '/pools',
                component: Pool,
                children: [
                    {
                        name: 'funiswap-pools',
                        path: '',
                        component: FUniswapPool,
                    },
                    {
                        name: 'add-liquidity',
                        path: '/add/:tokena?/:tokenb?',
                        component: AddLiquidity,
                        children: [
                            {
                                name: 'funiswap-add-liquidity',
                                path: '',
                                component: FUniswapAddLiquidity,
                            },
                            {
                                name: 'funiswap-add-liquidity-confirmation',
                                path: 'confirmation',
                                component: FUniswapAddLiquidityConfirmation,
                            },
                            {
                                name: 'funiswap-add-liquidity-confirmation2',
                                path: 'confirmation2',
                                component: FUniswapAddLiquidityConfirmation,
                            },
                            {
                                name: 'funiswap-add-liquidity-confirmation3',
                                path: 'confirmation3',
                                component: FUniswapAddLiquidityConfirmation,
                            },
                            {
                                name: 'funiswap-add-liquidity-transaction-success-message',
                                path: 'confirmation/success',
                                component: TransactionSuccessMessageView,
                            },
                            {
                                name: 'funiswap-add-liquidity-transaction-success-message2',
                                path: 'confirmation2/success2',
                                component: TransactionSuccessMessageView,
                            },
                            {
                                name: 'funiswap-add-liquidity-transaction-success-message3',
                                path: 'confirmation3/success3',
                                component: TransactionSuccessMessageView,
                            },
                            {
                                name: 'funiswap-add-liquidity-transaction-reject-message',
                                path: 'confirmation/reject',
                                component: TransactionRejectMessageView,
                            },
                            {
                                name: 'funiswap-add-liquidity-transaction-reject-message2',
                                path: 'confirmation2/reject2',
                                component: TransactionRejectMessageView,
                            },
                            {
                                name: 'funiswap-add-liquidity-transaction-reject-message3',
                                path: 'confirmation3/reject3',
                                component: TransactionRejectMessageView,
                            },
                        ],
                    },
                    {
                        name: 'remove-liquidity',
                        path: '/remove/:tokena?/:tokenb?',
                        component: RemoveLiquidity,
                        children: [
                            {
                                name: 'funiswap-remove-liquidity',
                                path: '',
                                component: FUniswapRemoveLiquidity,
                            },
                            {
                                name: 'funiswap-remove-liquidity-confirmation',
                                path: 'confirmation',
                                component: FUniswapRemoveLiquidityConfirmation,
                            },
                            {
                                name: 'funiswap-remove-liquidity-confirmation2',
                                path: 'confirmation2',
                                component: FUniswapRemoveLiquidityConfirmation,
                            },
                            {
                                name: 'funiswap-remove-liquidity-transaction-success-message',
                                path: 'confirmation/success',
                                component: TransactionSuccessMessageView,
                            },
                            {
                                name: 'funiswap-remove-liquidity-transaction-success-message2',
                                path: 'confirmation2/success2',
                                component: TransactionSuccessMessageView,
                            },
                            {
                                name: 'funiswap-remove-liquidity-transaction-reject-message',
                                path: 'confirmation/reject',
                                component: TransactionRejectMessageView,
                            },
                            {
                                name: 'funiswap-remove-liquidity-transaction-reject-message2',
                                path: 'confirmation2/reject2',
                                component: TransactionRejectMessageView,
                            },
                        ],
                    },
                    {
                        name: 'funiswap-pair-detail',
                        path: '/pair/:pairAddress',
                        component: FUniswapPairDetail,
                    },
                ],
            },
            {
                name: 'wrap-ftm',
                path: '/wrap-ftm',
                component: WrapFTM,
                children: [
                    {
                        name: 'funiswap-wrap-ftm',
                        path: '',
                        component: FUniswapWrapFTM,
                    },
                    {
                        name: 'funiswap-wrap-ftm-confirmation',
                        path: 'confirmation',
                        component: FUniswapWrapFTMConfirmation,
                    },
                    {
                        name: 'funiswap-wrap-ftm-transaction-success-message',
                        path: 'confirmation/success',
                        component: TransactionSuccessMessageView,
                    },
                    {
                        name: 'funiswap-wrap-ftm-transaction-reject-message',
                        path: 'confirmation/reject',
                        component: TransactionRejectMessageView,
                    },
                ],
            },
        ],
    },
    {
        name: 'not-found',
        path: '*',
        component: NotFound,
    },
];
