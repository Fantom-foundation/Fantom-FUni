<template>
    <ol class="ledger-confirmation-info f-data-layout">
        <li>
            <div class="row no-collapse">
                <div class="col-3 f-row-label">Send To</div>
                <div class="col break-word">
                    {{ $fWallet.toChecksumAddress(to) }}
                </div>
            </div>
        </li>
        <li>
            <div class="row no-collapse">
                <div class="col-3 f-row-label">Send From</div>
                <div class="col break-word">
                    {{ currentAccount.address }}
                    <span class="f-row-label">
                        <template v-if="currentAccount.name"><br /></template>
                        ( {{ toFTM(currentAccount.balance) }} FTM
                        <template v-if="currentAccount.name">, {{ currentAccount.name }}</template> )
                    </span>
                </div>
            </div>
        </li>
        <li>
            <div class="row no-collapse">
                <div class="col-3 f-row-label">Amount (FTM)</div>
                <div class="col">
                    {{ amount }}
                </div>
            </div>
        </li>
        <li v-if="txFee > 0">
            <div class="row no-collapse">
                <div class="col-3 f-row-label">Max Fee</div>
                <div class="col">{{ txFee }}</div>
            </div>
        </li>
        <slot></slot>
    </ol>
</template>

<script>
import { mapGetters } from 'vuex';
import { toFTM } from '../../utils/transactions.js';

/**
 * Content for ledger confirmation popups.
 */
export default {
    name: 'LedgerConfirmationContent',

    props: {
        /** `to` address. */
        to: {
            type: String,
            default: '',
            required: true,
        },
        amount: {
            type: [Number, String],
            default: 0,
        },
        maxFee: {
            type: [Number, String],
            default: 0,
        },
    },

    computed: {
        ...mapGetters(['currentAccount', 'txFee']),
    },

    methods: {
        toFTM,
    },
};
</script>
