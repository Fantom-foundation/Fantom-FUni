<template>
    <ol class="ledger-confirmation-info f-data-layout">
        <li>
            <div class="row no-collapse">
                <div class="col-3 f-row-label">Send To</div>
                <div class="col break-word">
                    {{ to }}
                </div>
            </div>
        </li>
        <li>
            <div class="row no-collapse">
                <div class="col-3 f-row-label">From</div>
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
                <div class="col-3 f-row-label">Amount</div>
                <div class="col">
                    {{ amount }}
                </div>
            </div>
        </li>
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
            type: Number,
            default: 0,
        },
    },

    computed: {
        ...mapGetters(['currentAccount']),
    },

    methods: {
        toFTM,
    },
};
</script>
