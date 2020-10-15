<template>
    <span class="f-auto-resize-input">
        <slot></slot>
        <span ref="twin" class="hidden-twin"></span>
    </span>
</template>

<script>
export default {
    name: 'FAutoResizeInput',

    props: {
        minWidth: {
            type: String,
            default: '16px',
        },
    },

    created() {
        /** @type {HTMLInputElement} */
        this._eInput = null;
    },

    mounted() {
        this._eInput = this.$el.querySelector('input');

        this.init();
    },

    beforeDestroy() {
        if (this._eInput) {
            this._eInput.removeEventListener('input', this.onInput);
            this._eInput.removeEventListener('change', this.onInput);
            this._eInput = null;
        }
    },

    methods: {
        init() {
            const eInput = this._eInput;
            const el = this.$el;

            if (eInput) {
                eInput.addEventListener('input', this.onInput);
                eInput.addEventListener('change', this.onInput);

                el.style.width = 'auto';
                el.style.minWidth = this.minWidth;

                this.update();
            }
        },

        update() {
            this.setTwinStyle();
            this.resizeInput();
        },

        resizeInput() {
            const eInput = this._eInput;
            const eTwin = this.$refs.twin;
            const el = this.$el;

            if (eInput) {
                // console.log(eInput.value);
                eTwin.textContent = eInput.value;
                // console.log(eTwin.offsetWidth);
                el.style.width = eTwin.offsetWidth + 4 + 'px';
            }
        },

        setTwinStyle() {
            const eTwin = this.$refs.twin;
            const eInputStyle = window.getComputedStyle(this._eInput);

            eTwin.style.padding = eInputStyle.padding;
            eTwin.style.fontSize = eInputStyle.fontSize;
            eTwin.style.fontFamily = eInputStyle.fontFamily;
        },

        onInput() {
            this.resizeInput();
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
