<template>
    <span class="address-field form-field">
        <f-input ref="input" v-model="inputValue" v-bind="fInputProps" @input="onInput">
            <template #top="sProps">
                <div class="input-label-layout">
                    <label :for="sProps.inputId">{{ sProps.label }}</label>
                    <button v-show="selectBtnVisible" type="button" class="btn light small" @click="onSelectClick">
                        Select Address
                    </button>
                </div>
            </template>
            <template #prefix="sProps">
                <slot name="prefix" v-bind="sProps"></slot>
            </template>
            <template #suffix="sProps">
                <slot name="suffix" v-bind="sProps">
                    <span @click="onAddAddressBtnClick">
                        <span
                            v-show="addAddressBtnVisible"
                            class="btn same-size round small light"
                            aria-hidden="true"
                            tabindex="0"
                            title="Add To Address Book"
                        >
                            <icon data="@/assets/svg/plus.svg" width="16" height="16" aria-hidden="true" />
                        </span>
                    </span>
                </slot>
            </template>
            <template #bottom="sProps">
                <slot name="bottom" v-bind="sProps"></slot>
            </template>
        </f-input>

        <address-picker-window ref="pickAddressWindow" :blockchain="blockchain" @address-picked="onAddressPicked" />

        <contact-detail-window
            ref="contactDetailWindow"
            action="add"
            :contact-data="contactData"
            @contact-detail-form-data="onContactDetailFormData"
        />
    </span>
</template>

<script>
import FInput from '../core/FInput/FInput.vue';
import { inputMixin } from '../../mixins/input.js';
import AddressPickerWindow from '../windows/AddressPickerWindow/AddressPickerWindow.vue';
import { mapGetters } from 'vuex';
import ContactDetailWindow from '../windows/ContactDetailWindow/ContactDetailWindow.vue';
import { ADD_CONTACT } from '../../store/actions.type.js';

/**
 * Input field with possibility to pick an address from address book or wallets and for adding address to address book.
 */
export default {
    name: 'AddressField',

    components: { ContactDetailWindow, AddressPickerWindow, FInput },

    mixins: [inputMixin],

    props: {
        ...FInput.props,
        /** @type {WalletBlockchain} */
        blockchain: {
            type: String,
            default: 'fantom',
            validator: function (_value) {
                return ['fantom', 'ethereum', 'binance'].indexOf(_value) !== -1;
            },
        },
    },

    data() {
        return {
            inputValue: '',
            /** @type {WalletContact} */
            contactData: {},
            addAddressBtnVisible: false,
        };
    },

    computed: {
        ...mapGetters(['getContactAndIndexByAddress', 'getAccountAndIndexByAddress', 'getContactsByBlockchain']),

        selectBtnVisible() {
            const { blockchain } = this;

            if (blockchain !== 'fantom') {
                return this.getContactsByBlockchain(blockchain).length > 0;
            }

            return true;
        },

        fInputProps() {
            return {
                ...FInput.computed.fInputProps.call(this),
            };
        },
    },

    methods: {
        setAddAddressBtnVisibility(_address) {
            this.addAddressBtnVisible =
                !!_address &&
                this.$fWallet.isValidAddress(_address, this.blockchain) &&
                !(
                    (this.blockchain === 'fantom' && this.getAccountAndIndexByAddress(_address).index !== -1) ||
                    this.getContactAndIndexByAddress(_address).index !== -1
                );
        },

        async validate() {
            await this.$refs.input.validate();
        },

        onSelectClick() {
            this.$refs.pickAddressWindow.show();
        },

        onAddressPicked(_address) {
            this.inputValue = _address;
            this.$refs.input.$refs.input.focus();
            this.setAddAddressBtnVisibility(_address);
        },

        onAddAddressBtnClick() {
            const address = this.inputValue.trim();

            if (address) {
                this.contactData = {
                    address,
                    blockchain: this.blockchain,
                };

                this.$refs.contactDetailWindow.show();
            }
        },

        /**
         * Called when `ContactSettingsForm` is submited.
         *
         * @param {object} _data
         */
        onContactDetailFormData(_data) {
            this.$store.dispatch(ADD_CONTACT, { ..._data, blockchain: this.blockchain });
            this.setAddAddressBtnVisibility(_data.address);
        },

        onInput(_value) {
            this.setAddAddressBtnVisibility(_value.trim());
            this.$emit('input', _value);
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
