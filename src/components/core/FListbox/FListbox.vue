<template>
    <ul
        class="flistbox no-markers"
        role="listbox"
        tabindex="0"
        :aria-activedescendant="selectedItem.id"
        :aria-labelledby="labeledBy"
        @click="onClick"
        @keydown="onKeydown"
        @focus="onFocus"
    >
        <li
            v-for="item in cItems"
            :id="item.id"
            :key="item.id"
            role="option"
            :aria-selected="item.id === selectedItem.id"
            :aria-disabled="!!item.disabled"
            class="flistbox_item"
        >
            <slot :item="item">
                {{ item.label }}
            </slot>
        </li>
    </ul>
</template>

<script>
import { helpersMixin } from '../../../mixins/helpers.js';
import { cloneObject } from '../../../utils';
import { isKey, keyboardNavigation } from '../../../utils/aria.js';

/**
 * Listbox component created according to WAI-ARIA rules and practices.
 */
export default {
    name: 'FListbox',

    mixins: [helpersMixin],

    props: {
        /** Listbox's items */
        items: {
            type: Array,
            default() {
                return [];
            },
        },
        /** Id of element that represents label for the listbox */
        labeledBy: {
            type: String,
            default: '',
        },
        /** If `true`, `listbox-item-selected` event will be fired right on item focus (keyboard movement, click) */
        selectImmediately: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            selectedItem: {},
            selectableItemSelector: '.flistbox_item:not([aria-disabled="true"])',
        };
    },

    computed: {
        cItems() {
            const items = [...this.items];

            this.setIds(items);

            return items;
        },
    },

    methods: {
        /**
         * Select item by `_key`.
         *
         * @param {*} _value Item value.
         * @param {string} [_key] Name of item key.
         */
        focusItem(_value, _key = 'id') {
            let item;

            if (_value) {
                item = this.cItems.find((_item) => _item[_key] === _value);

                if (item && item.id !== this.selectedItem.id) {
                    if (this.selectImmediately) {
                        this.$emit('listbox-item-selected', cloneObject(item));
                    }

                    this.selectedItem = item;

                    this.scrollToFocusedItem();
                }
            }
        },

        scrollToFocusedItem() {
            const id = this.selectedItem.id;
            const { $el } = this;
            const listboxHeight = $el.clientHeight;
            let eItem;

            if (id && $el.scrollHeight > listboxHeight) {
                eItem = document.getElementById(id);
                if (eItem) {
                    const listboxScrollTop = $el.scrollTop;
                    const eItemOffsetTop = eItem.offsetTop;
                    const eItemBottom = eItemOffsetTop + eItem.offsetHeight;

                    if (eItemBottom > listboxScrollTop + listboxHeight) {
                        $el.scrollTop = eItemBottom - listboxHeight;
                    } else if (eItemOffsetTop < listboxScrollTop) {
                        $el.scrollTop = eItemOffsetTop;
                    }
                }
            }
        },

        /**
         * @param {Event} _event
         */
        onClick(_event) {
            const eItem = _event.target.closest(this.selectableItemSelector);

            if (eItem) {
                this.focusItem(eItem.id);
            }
        },

        /**
         * @param {KeyboardEvent} _event
         */
        onKeydown(_event) {
            const eItem = keyboardNavigation({
                _event,
                _selector: this.selectableItemSelector,
                _direction: 'vertical',
                _circular: true,
                _target: document.getElementById(this.selectedItem.id),
                _focusElem: false,
            });

            if (eItem) {
                _event.preventDefault();
                this.focusItem(eItem.id);
            } else if (!this.selectImmediately && isKey('Enter', _event)) {
                this.$emit('listbox-item-selected', cloneObject(this.selectedItem));
            }
        },

        onFocus() {
            let item;

            if (!this.selectedItem.id) {
                item = this.cItems.find((_item) => !_item.disabled);
                if (item) {
                    this.selectedItem = item;
                }
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
