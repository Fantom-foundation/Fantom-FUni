<template>
    <f-toggle-button v-model="rtlDirOn" :label="label" class="rtlswitch" />
</template>

<script>
import FToggleButton from '@/components/core/FToggleButton/FToggleButton.vue';
import { removeAttr, setAttr } from '@/utils/DOM.js';
import { store } from '@/store';
import { SET_RTL_DIR } from '@/store/mutations.type.js';

export function switchRTLDirection(rtl = false) {
    if (rtl) {
        setAttr(document.documentElement, 'dir', 'rtl');
        store.commit(SET_RTL_DIR, true);
    } else {
        removeAttr(document.documentElement, 'dir');
        store.commit(SET_RTL_DIR, false);
    }
}

export default {
    name: 'RTLSwitch',

    components: { FToggleButton },

    props: {
        switchOnTitle: {
            type: String,
            default: 'Left-to-right direction',
        },
        switchOffTitle: {
            type: String,
            default: 'Right-to-left direction',
        },
    },

    data() {
        return {
            rtlDirOn: this.$store.state.rtlDir,
        };
    },

    computed: {
        label() {
            return this.rtlDirOn ? this.switchOnTitle : this.switchOffTitle;
        },
    },

    watch: {
        rtlDirOn(value) {
            switchRTLDirection(value);
        },
    },
};
</script>
