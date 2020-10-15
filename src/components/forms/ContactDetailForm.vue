<template>
    <div class="contact-detail-form">
        <f-form center-form @f-form-submit="onFormSubmit">
            <fieldset>
                <legend class="not-visible">Contact Detail</legend>

                <div class="form-body">
                    <f-input
                        v-if="action === 'new'"
                        ref="eAddress"
                        v-model="address"
                        type="text"
                        label="Address"
                        field-size="large"
                        name="address"
                        validate-on-input
                        :validator="checkAddress"
                    >
                        <template #bottom="sProps">
                            <f-message v-show="sProps.showErrorMessage" type="error" role="alert" with-icon>
                                {{ addressErrorMsg }}
                            </f-message>
                        </template>
                    </f-input>
                    <template v-else>
                        <span class="form-label">Address</span>
                        <div class="break-word">
                            <b style="padding-right: 16px">{{ contactData.address }}</b>
                            <f-copy-button
                                :text="contactData.address"
                                tooltip="Copy address to clipboard"
                                :hide-popover-after="3100"
                                class="btn large light same-size round"
                            >
                                <template #popover-text>
                                    Address copied to clipboard. <br />
                                    Warning: Use this address to receive Opera FTM only. If you are receiving FTM-ERC20
                                    you need to use a different address!
                                </template>
                            </f-copy-button>
                            <button
                                class="btn large light same-size round"
                                title="Show QR Code"
                                type="button"
                                @click.prevent="$refs.qrWindow.show()"
                            >
                                <icon data="@/assets/svg/qr.svg" width="20" height="20" aria-hidden="true" />
                            </button>
                        </div>
                        <br />
                    </template>

                    <f-input
                        :value="contactName"
                        type="text"
                        label="Name"
                        field-size="large"
                        name="name"
                        validate-on-input
                        :validator="checkName"
                    >
                        <template #bottom="sProps">
                            <f-message v-show="sProps.showErrorMessage" type="error" role="alert" with-icon>
                                This field cannot be blank
                            </f-message>
                        </template>
                    </f-input>

                    <f-select
                        v-if="action === 'new'"
                        v-model="blockchain"
                        :data="$fWallet.blockchains"
                        select-size="large"
                        label="Blockchain"
                        name="blockchain"
                    />
                    <template v-else>
                        <span class="form-label">Blockchain</span>
                        <div class="break-word">
                            {{ $fWallet.getBlockchainLabel(contactData.blockchain) }}
                        </div>
                        <br />
                    </template>

                    <f-input
                        :value="contactOrder"
                        type="number"
                        autocomplete="off"
                        min="1"
                        :max="maxOrder.toString(10)"
                        step="1"
                        label="Order"
                        field-size="large"
                        name="order"
                        validate-on-input
                        :validator="checkOrder"
                    >
                        <template #bottom="sProps">
                            <f-message v-show="sProps.showErrorMessage" type="error" role="alert" with-icon>
                                Value must be between 1 and {{ maxOrder }}
                            </f-message>
                        </template>
                    </f-input>

                    <div class="align-center form-buttons">
                        <a
                            v-if="action === 'edit'"
                            href="#"
                            class="btn large secondary"
                            @click.prevent="onRemoveContactBtnClick"
                        >
                            Remove Contact...
                        </a>
                        <button type="submit" class="btn large">Save</button>
                    </div>
                </div>
            </fieldset>
        </f-form>

        <remove-contact-window
            ref="confirmationWindow"
            :contact-address="address"
            @contact-removed="onContactRemoved"
        />

        <q-r-code-window ref="qrWindow" :address="contactData.address">
            <f-message v-show="blockchain === 'fantom'" type="warning" with-icon>
                Warning: Use this address to receive Opera FTM only. If you are receiving FTM-ERC20 you need to use a
                different address!
            </f-message>
        </q-r-code-window>
    </div>
</template>

<script>
import FForm from '../core/FForm/FForm.vue';
import FInput from '../core/FInput/FInput.vue';
import { mapGetters } from 'vuex';
import FMessage from '../core/FMessage/FMessage.vue';
import { helpersMixin } from '../../mixins/helpers.js';
import FCopyButton from '../core/FCopyButton/FCopyButton.vue';
import QRCodeWindow from '../windows/QRCodeWindow/QRCodeWindow.vue';
import FSelect from '../core/FSelect/FSelect.vue';
import RemoveContactWindow from '../windows/RemoveContactWindow/RemoveContactWindow.vue';
// import RemoveContactWindow from '../windows/RemoveContactWindow/RemoveContactWindow.vue';

/**
 * @mixes helpersMixin
 */
export default {
    name: 'ContactDetailForm',

    components: { RemoveContactWindow, FSelect, QRCodeWindow, FCopyButton, FMessage, FInput, FForm },

    mixins: [helpersMixin],

    props: {
        /**
         * Contact data
         *
         * @type {WalletContact}
         */
        contactData: {
            type: Object,
            default() {
                return {};
            },
            required: true,
        },
        /**
         * Type of action with contact.
         *
         * @type {WalletContactAction}
         */
        action: {
            type: String,
            default: 'new',
            validator: function (_value) {
                return ['new', 'add', 'edit'].indexOf(_value) !== -1;
            },
        },
    },

    data() {
        return {
            address: '',
            /** @type {WalletBlockchain} */
            blockchain: 'fantom',
            addressErrorMsg: '',
        };
    },

    computed: {
        ...mapGetters(['contacts', 'getContactAndIndexByAddress', 'getAccountAndIndexByAddress']),

        /**
         * @return {string}
         */
        contactName() {
            return this.contactData.name || `Contact ${this.contacts.length + 1}`;
        },

        /**
         * @return {string}
         */
        contactOrder() {
            let order = this.contactData.order || -1;
            const { action } = this;

            if (order === -1 && this.contactData.address) {
                const { index } = this.getContactAndIndexByAddress(this.contactData.address);
                order = index + 1;
            }

            if (action === 'new' || action === 'add') {
                order = this.contacts.length + 1;
            }

            /*
            if (this.action === 'new' && order === this.contacts.length) {
                order++;
            }
*/

            if (order < 1) {
                order = 1;
            }

            return order.toString(10);
        },

        maxOrder() {
            const len = this.contacts.length;
            const { action } = this;

            return action === 'new' || action === 'add' ? len + 1 : len;
        },
    },

    watch: {
        blockchain() {
            const { eAddress } = this.$refs;

            if (eAddress && this.address) {
                eAddress.validate();
            }
        },
    },

    mounted() {
        this.address = this.contactData.address || '';
        this.blockchain = this.contactData.blockchain || 'fantom';
        // this.contact = this.getContactByAddress(this.contactData.address);
    },

    methods: {
        /**
         * @param {string} _value
         * @return {boolean}
         */
        checkName(_value) {
            return !!_value.trim();
        },

        /**
         * @param {string} _value
         * @return {boolean}
         */
        checkAddress(_value) {
            const { blockchain } = this;
            const { action } = this;
            let ok = true;

            if (action !== 'new' && action !== 'add') {
                return true;
            }

            this.addressErrorMsg = '';

            if (!(ok = !!_value.trim())) {
                this.addressErrorMsg = 'This field cannot be blank';
            } else if (!(ok = this.$fWallet.isValidAddress(_value, blockchain))) {
                if (blockchain === 'fantom') {
                    this.addressErrorMsg = 'Not valid fantom address';
                } else if (blockchain === 'ethereum') {
                    this.addressErrorMsg = 'Not valid ethereum address';
                } else if (blockchain === 'binance') {
                    this.addressErrorMsg = 'Not valid binance address';
                }
            } else if (
                this.getContactAndIndexByAddress(_value).index !== -1 ||
                (blockchain === 'fantom' && this.getAccountAndIndexByAddress(_value).index !== -1)
            ) {
                this.addressErrorMsg = 'Address already exists';
                ok = false;
            }

            return ok;
        },

        /**
         * @param {string} _value
         * @return {boolean}
         */
        checkOrder(_value) {
            let ok = false;
            const value = parseInt(_value);
            const contactsLen = this.contacts.length;
            const { action } = this;
            const max = action === 'new' || action === 'add' ? contactsLen + 1 : contactsLen;

            if (!isNaN(value)) {
                ok = value > 0 && value <= max;
            }

            return ok;
        },

        /**
         * @param {{detail: {data: {}}}} _event
         */
        onFormSubmit(_event) {
            const { data } = _event.detail;
            const { name } = data;
            const order = parseInt(data.order);
            const address = data.address || this.address;

            if (this.checkName(name) && this.checkOrder(order) && this.checkAddress(address)) {
                this.$emit('contact-detail-form-data', { ...data, name, order, address });
            }
        },

        onRemoveContactBtnClick() {
            this.$refs.confirmationWindow.show();
        },

        onContactRemoved() {
            const parentWindow = this.findParentByName('f-window');

            if (parentWindow) {
                parentWindow.hide();
            }
        },
    },
};
</script>
