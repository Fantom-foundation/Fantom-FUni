<template>
    <ul
        class="flistbox no-markers"
        role="listbox"
        tabindex="0"
        :aria-activedescendant="focusedItem.id"
        :aria-labelledby="labeledBy"
        @click="onClick"
        @keydown="onKeydown"
        @keyup="onKeyup"
        @focus="onFocus"
    >
        <li
            v-for="item in cItems"
            :id="item.id"
            :key="item.id"
            role="option"
            :aria-selected="item.id === focusedItem.id"
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
        /** If `true`, first focusable item will be focused. */
        focusItemOnFocus: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            focusedItem: {},
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
         * @param {boolean} [_selectItem]
         * @param {string} [_key] Name of item key.
         */
        focusItem(_value, _selectItem, _key = 'id') {
            let item;

            if (_value) {
                item = this.cItems.find((_item) => _item[_key] === _value);

                // if (item && item.id !== this.focusedItem.id) {
                if (item) {
                    if (this.selectImmediately || _selectItem) {
                        this.$emit('listbox-item-selected', cloneObject(item));
                    }

                    this.focusedItem = item;

                    this.scrollToFocusedItem();
                }
            }
        },

        scrollToFocusedItem() {
            const id = this.focusedItem.id;
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
         * Focus first focusable item.
         */
        focusFirstItem() {
            const item = this.cItems.find((_item) => !_item.disabled);

            if (item) {
                this.focusedItem = item;
            }
        },

        /**
         * @param {Event} _event
         */
        onClick(_event) {
            const eItem = _event.target.closest(this.selectableItemSelector);

            if (eItem) {
                this.focusItem(eItem.id, true);
            }
        },

        /**
         * @param {KeyboardEvent} _event
         */
        onKeydown(_event) {
            let eItem = keyboardNavigation({
                _event,
                _selector: this.selectableItemSelector,
                _direction: 'vertical',
                _circular: true,
                _target: document.getElementById(this.focusedItem.id),
                _focusElem: false,
            });

            if (!eItem && !this.focusedItem.id && (isKey('ArrowDown', _event) || isKey('ArrowUp', _event))) {
                this.focusFirstItem();
                eItem = document.getElementById(this.focusedItem.id);
            }

            if (eItem) {
                _event.preventDefault();
                this.focusItem(eItem.id);
            }
        },

        /**
         * @param {KeyboardEvent} _event
         */
        onKeyup(_event) {
            if (!this.selectImmediately && this.focusedItem.id && isKey('Enter', _event)) {
                this.$emit('listbox-item-selected', cloneObject(this.focusedItem));
            }
        },

        onFocus() {
            if (this.focusItemOnFocus && !this.focusedItem.id) {
                this.focusFirstItem();
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
